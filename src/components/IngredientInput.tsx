
import React, { useState, useEffect } from 'react';
import { Mic, Loader2, X, Send, RefreshCw, MicOff, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState<string>('');
  const [autoSubmitTimeout, setAutoSubmitTimeout] = useState<NodeJS.Timeout | null>(null);
  
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
        title: "Transcription Complete",
        description: "Your voice has been converted to text"
      });
      
      // Set a timeout to automatically submit after transcription (with delay)
      const timeout = setTimeout(() => {
        if (text.trim()) {
          console.log('Auto-submitting after transcription:', text);
          handleSubmit(new Event('auto-submit') as unknown as React.FormEvent);
        }
      }, 1500); // 1.5 second delay before auto-submission
      
      setAutoSubmitTimeout(timeout);
    },
    onTranscriptionError: (err) => {
      console.error('Transcription error in component:', err);
      toast({
        variant: "destructive", 
        title: "Transcription Failed", 
        description: err.message || "Error transcribing audio"
      });
    }
  });
  
  // Update ingredients when transcript changes
  useEffect(() => {
    if (transcript) {
      setIngredients(transcript);
    }
  }, [transcript]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimeout) {
        clearTimeout(autoSubmitTimeout);
      }
    };
  }, [autoSubmitTimeout]);
  
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
          title: "Error Submitting",
          description: "There was a problem submitting the ingredients. Please try again."
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Empty Ingredients",
        description: "Please enter ingredients or record your voice"
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
      <h2 className="text-xl font-bold mb-3 text-carnivore-foreground">What ingredients do you have?</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Type ingredients (e.g. beef, salt, butter)"
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
                  Voice recording is not supported in this browser or requires HTTPS.
                </p>
              </div>
            </div>
          ) : !isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors disabled:opacity-50"
              disabled={isTranscribing}
              title="Click to start recording"
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stopRecording}
                className="relative bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                title="Click to stop recording"
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
                title="Cancel recording"
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
                Transcribing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Generate Recipe
              </>
            )}
          </button>
          
          {(transcript || error) && (
            <button 
              type="button"
              onClick={handleRetry}
              className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors"
              title="Try again"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {isRecording && (
          <div className="text-center text-sm text-carnivore-secondary mt-1">
            Recording... Speak clearly into your microphone
          </div>
        )}
      </form>
    </div>
  );
};

export default IngredientInput;
