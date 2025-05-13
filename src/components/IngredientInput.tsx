
import React, { useState, useRef } from 'react';
import { Search, Mic, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../hooks/useRecipes';
import { toast } from 'sonner';

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Specify audio/mp3 or audio/wav format for better compatibility with OpenAI's API
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/wav' 
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          // Use mp3 format which is supported by OpenAI
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          console.log("Audio type:", audioBlob.type, "Audio size:", audioBlob.size);
          
          const transcription = await transcribeAudio(audioBlob);
          setIngredients(transcription);
          toast.success('Voice input processed successfully');
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to process voice input');
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
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
