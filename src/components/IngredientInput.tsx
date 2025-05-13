
import React, { useState, useRef } from 'react';
import { Search, Mic, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../hooks/useRecipes';
import { toast } from '@/components/ui/use-toast';

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients);
    }
  };

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    for (const type of types) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log(`Browser supports recording with mime type: ${type}`);
          return type;
        }
      } catch (e) {
        console.log(`Error checking support for ${type}:`, e);
      }
    }
    console.log('No supported audio MIME types found');
    return 'audio/webm'; // Fallback
  };

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      console.log('Microphone access granted');
      const mimeType = getSupportedMimeType();
      
      let options = {};
      try {
        options = { mimeType };
        console.log(`Using mime type for recording: ${mimeType}`);
      } catch (e) {
        console.log('Failed to set mime type, using default', e);
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available from recorder:', event.data?.type, event.data?.size);
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          console.log('Recording stopped, processing audio chunks');
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data was recorded');
          }
          
          const mimeType = audioChunksRef.current[0].type || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          console.log(`Audio preparation complete: type=${audioBlob.type}, size=${audioBlob.size} bytes`);
          
          if (audioBlob.size < 100) {
            throw new Error('Audio recording is too short or empty');
          }
          
          const transcription = await transcribeAudio(audioBlob);
          console.log('Transcription received:', transcription);
          setIngredients(transcription);
          toast({
            title: "Success",
            description: "Voice input processed successfully",
          });
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Error",
            description: `Failed to process voice input: ${error.message}`,
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorder.start();
      console.log('Recording started');
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: `Could not access microphone: ${error.message}. Please check your browser permissions.`,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording');
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-3 text-center">
        What ingredients do you have?
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ex.: 300g of steak, eggs, butter..."
            className="input-field w-full pr-12"
          />
          <button 
            type="button"
            onClick={handleVoiceInput}
            disabled={isProcessing}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              isRecording 
                ? 'text-carnivore-primary animate-pulse' 
                : isProcessing 
                ? 'text-carnivore-secondary opacity-60'
                : 'text-carnivore-secondary hover:text-carnivore-primary'
            }`}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500' : ''}`} />
            )}
          </button>
        </div>
        <button 
          type="submit" 
          className="btn-primary w-full flex items-center justify-center"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Search className="h-5 w-5 mr-2" />
          )}
          Find Recipes
        </button>
      </form>
    </div>
  );
};

export default IngredientInput;
