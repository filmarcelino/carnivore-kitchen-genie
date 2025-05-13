
import React, { useState, useEffect } from 'react';
import { Mic, Loader2, X, Send, RefreshCw, MicOff, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState<string>('');
  
  // Use our custom voice recorder hook
  const {
    isRecording,
    isTranscribing,
    error,
    transcript,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState,
    isSupported
  } = useVoiceRecorder({
    onTranscriptionComplete: (text) => {
      console.log('Transcription completed:', text);
      setIngredients(text);
      toast({
        title: "Transcrição Concluída",
        description: "Sua voz foi convertida em texto"
      });
    },
    onTranscriptionError: (err) => {
      console.error('Transcription error in component:', err);
      toast({
        variant: "destructive", 
        title: "Falha na Transcrição", 
        description: err.message || "Erro ao transcrever áudio"
      });
    }
  });
  
  // Update ingredients when transcript changes
  useEffect(() => {
    if (transcript) {
      setIngredients(transcript);
    }
  }, [transcript]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredients.trim()) {
      console.log('Submitting ingredients:', ingredients);
      // Store original ingredients before clearing
      const submittedIngredients = ingredients;
      
      try {
        onSubmit(submittedIngredients);
        // Only clear after successful submission
        setIngredients('');
      } catch (error) {
        console.error('Error submitting ingredients:', error);
        toast({
          variant: "destructive",
          title: "Erro ao Enviar",
          description: "Houve um problema ao enviar os ingredientes. Tente novamente."
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Ingredientes Vazios",
        description: "Por favor, informe os ingredientes ou grave sua voz"
      });
    }
  };
  
  const handleRetry = () => {
    console.log('Retrying voice recording');
    resetState();
    setIngredients('');
  };
  
  return (
    <div className="card p-4">
      <h2 className="text-xl font-bold mb-3 text-carnivore-foreground">Quais ingredientes você tem?</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Digite os ingredientes (ex: carne, sal, manteiga)"
          className="input-field min-h-[100px] resize-none"
          disabled={isRecording || isTranscribing}
        />
        
        {error && (
          <div className="bg-red-100 border border-red-300 rounded-md p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!isSupported ? (
            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <p className="text-yellow-700 text-sm">
                  Gravação de voz não suportada neste navegador ou requer HTTPS.
                </p>
              </div>
            </div>
          ) : !isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors disabled:opacity-50"
              disabled={isTranscribing}
              title="Clique para iniciar a gravação"
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stopRecording}
                className="relative bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                title="Clique para parar a gravação"
              >
                {/* Pulsing animation for recording indicator */}
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50"></div>
                <div className="w-5 h-5 flex items-center justify-center z-10 relative">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={cancelRecording}
                className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors"
                title="Cancelar gravação"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <button
            type="submit"
            className="btn-primary flex-1 flex justify-center items-center"
            disabled={isRecording || isTranscribing || !ingredients.trim()}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Transcrevendo...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Gerar Receita
              </>
            )}
          </button>
          
          {(transcript || error) && (
            <button 
              type="button"
              onClick={handleRetry}
              className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors"
              title="Tentar novamente"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {isRecording && (
          <div className="text-center text-sm text-carnivore-secondary mt-1">
            Gravando... Fale claramente no seu microfone
          </div>
        )}
      </form>
    </div>
  );
};

export default IngredientInput;
