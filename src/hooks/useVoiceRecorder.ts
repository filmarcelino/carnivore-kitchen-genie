
import { useState, useRef, useEffect } from 'react';
import { toast } from './use-toast';

interface UseVoiceRecorderOptions {
  onTranscriptionComplete?: (transcript: string) => void;
  onTranscriptionError?: (error: Error) => void;
}

interface VoiceRecorderState {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  transcript: string | null;
}

export const useVoiceRecorder = (options?: UseVoiceRecorderOptions) => {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isTranscribing: false,
    error: null,
    transcript: null
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Check if we're in a secure context (HTTPS or localhost)
  const [isSecureContext, setIsSecureContext] = useState<boolean>(false);
  
  // Check browser support for MediaRecorder and audio types
  const [browserSupport, setBrowserSupport] = useState({
    mediaDevices: false,
    mediaRecorder: false,
    webmSupport: false,
    mp4Support: false
  });
  
  useEffect(() => {
    // Check if we're in a secure context
    const secureContext = window.isSecureContext || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    setIsSecureContext(secureContext);
    console.log('Is secure context:', secureContext);
    
    // Check browser support for MediaDevices
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    // Check browser support for MediaRecorder
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    
    // Check audio format support
    const hasWebmSupport = hasMediaRecorder && MediaRecorder.isTypeSupported('audio/webm');
    const hasMp4Support = hasMediaRecorder && MediaRecorder.isTypeSupported('audio/mp4');
    
    setBrowserSupport({
      mediaDevices: hasMediaDevices,
      mediaRecorder: hasMediaRecorder,
      webmSupport: hasWebmSupport,
      mp4Support: hasMp4Support
    });
    
    console.log('Voice recorder browser support:', {
      mediaDevices: hasMediaDevices,
      mediaRecorder: hasMediaRecorder,
      webmSupport: hasWebmSupport,
      mp4Support: hasMp4Support,
      isSecureContext: secureContext
    });
  }, []);
  
  // Get preferred MIME type based on browser support
  const getPreferredMimeType = (): string => {
    if (browserSupport.webmSupport) return 'audio/webm';
    if (browserSupport.mp4Support) return 'audio/mp4';
    return 'audio/webm'; // Default fallback
  };
  
  const startRecording = async () => {
    console.log('Attempting to start recording...');
    
    // Reset state
    setState(prev => ({ ...prev, error: null, transcript: null }));
    audioChunksRef.current = [];
    
    // Security checks
    if (!isSecureContext) {
      const securityError = 'Gravação de voz requer um contexto seguro (HTTPS ou localhost)';
      console.error(securityError);
      setState(prev => ({ ...prev, error: securityError }));
      toast({ variant: "destructive", title: "Erro de Segurança", description: securityError });
      return;
    }
    
    // Browser support checks
    if (!browserSupport.mediaDevices) {
      const deviceError = 'Seu navegador não suporta acesso ao microfone';
      console.error(deviceError);
      setState(prev => ({ ...prev, error: deviceError }));
      toast({ variant: "destructive", title: "Erro de Compatibilidade", description: deviceError });
      return;
    }
    
    if (!browserSupport.mediaRecorder) {
      const supportError = 'Seu navegador não suporta gravação de voz';
      console.error(supportError);
      setState(prev => ({ ...prev, error: supportError }));
      toast({ variant: "destructive", title: "Erro de Compatibilidade", description: supportError });
      return;
    }
    
    if (!browserSupport.webmSupport && !browserSupport.mp4Support) {
      const formatError = 'Seu navegador não suporta nenhum formato de áudio compatível';
      console.error(formatError);
      setState(prev => ({ ...prev, error: formatError }));
      toast({ variant: "destructive", title: "Erro de Formato", description: formatError });
      return;
    }
    
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      
      const mimeType = getPreferredMimeType();
      console.log(`Using MIME type: ${mimeType}`);
      
      // Use explicit options object with correct mimeType
      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // Set reasonable bitrate
      });
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log(`Recorded audio chunk: ${e.data.size} bytes, type: ${e.data.type}`);
        }
      };
      
      recorder.onstart = () => {
        console.log('Recording started');
        setState(prev => ({ ...prev, isRecording: true }));
      };
      
      recorder.onstop = async () => {
        console.log('Recording stopped');
        setState(prev => ({ ...prev, isRecording: false }));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Make sure we have audio chunks
        if (audioChunksRef.current.length === 0) {
          console.error('No audio chunks recorded');
          setState(prev => ({ ...prev, error: 'Nenhum áudio gravado. Por favor, tente novamente.' }));
          toast({ 
            variant: "destructive", 
            title: "Erro na Gravação", 
            description: "Nenhum áudio foi gravado. Por favor, tente novamente." 
          });
          return;
        }
        
        // Process recorded audio
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`Recorded audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // Log blob details for debugging
        console.log('Audio blob details:', {
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        // Validate audio size
        if (audioBlob.size < 100) { // Arbitrary minimum size check
          const sizeError = 'Áudio gravado é muito curto ou vazio';
          console.error(sizeError);
          setState(prev => ({ ...prev, error: sizeError }));
          toast({ variant: "destructive", title: "Erro na Gravação", description: sizeError });
          return;
        }
        
        // Transcribe audio
        await transcribeAudio(audioBlob);
      };
      
      // Setup data collection - request data every 1 second to ensure we get chunks
      recorder.start(1000);
      console.log('Recording started with timeslice of 1000ms');
      
    } catch (error: any) {
      console.error('Recording error:', error);
      
      let errorMessage = 'Falha ao acessar o microfone';
      
      // Handle specific permission errors
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Acesso ao microfone foi negado. Por favor, permita o acesso e tente novamente.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhum microfone detectado. Por favor, conecte um microfone e tente novamente.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'O microfone já está em uso por outro aplicativo.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Gravação de voz requer um contexto seguro (HTTPS).';
      } else {
        errorMessage = `Erro de microfone: ${error.message || 'Erro desconhecido'}`;
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({ variant: "destructive", title: "Erro de Microfone", description: errorMessage });
    }
  };
  
  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const cancelRecording = () => {
    console.log('Canceling recording...');
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = []; // Clear recorded chunks
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        transcript: null 
      }));
      toast({ title: "Gravação Cancelada" });
    }
  };
  
  const transcribeAudio = async (audioBlob: Blob) => {
    setState(prev => ({ ...prev, isTranscribing: true }));
    console.log('Transcribing audio...');
    
    try {
      // Import the transcribeAudio function from the recipes hook
      const { transcribeAudio: transcribe } = await import('./useRecipes');
      
      const transcript = await transcribe(audioBlob);
      console.log('Transcription succeeded:', transcript);
      
      if (!transcript) {
        throw new Error('Nenhuma transcrição retornada');
      }
      
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false,
        transcript,
        error: null
      }));
      
      // Call the completion callback if provided
      if (options?.onTranscriptionComplete) {
        options.onTranscriptionComplete(transcript);
      }
      
    } catch (error: any) {
      console.error('Transcription error:', error);
      const errorMessage = error.message || 'Falha ao transcrever áudio';
      
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false,
        error: errorMessage
      }));
      
      // Call the error callback if provided
      if (options?.onTranscriptionError) {
        options.onTranscriptionError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };
  
  const resetState = () => {
    setState({
      isRecording: false,
      isTranscribing: false,
      error: null,
      transcript: null
    });
  };
  
  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
    isSupported: browserSupport.mediaDevices && browserSupport.mediaRecorder && 
                (browserSupport.webmSupport || browserSupport.mp4Support) && isSecureContext
  };
};
