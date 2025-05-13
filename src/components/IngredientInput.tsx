
import React, { useState, useRef } from 'react';
import { Mic, Loader2, X, Send } from 'lucide-react';
import { transcribeAudio } from '../hooks/useRecipes';
import { toast } from 'sonner';

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudio(audioBlob);
            if (transcript) {
              setIngredients(transcript);
              toast.success('Successfully transcribed your voice input!');
            } else {
              throw new Error('No transcription returned');
            }
          } catch (error: any) {
            console.error('Transcription error:', error);
            setRecordingError(error.message || 'Failed to transcribe audio');
            toast.error(`Transcription failed: ${error.message}`);
          } finally {
            setIsTranscribing(false);
          }
        } else {
          setRecordingError('No audio recorded');
          toast.error('No audio was recorded. Please try again.');
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Recording error:', error);
      setRecordingError(error.message || 'Could not access microphone');
      toast.error(`Microphone access error: ${error.message}`);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Clear the recorded chunks
      audioChunksRef.current = [];
      toast.info('Recording cancelled');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients);
      setIngredients('');
    } else {
      toast.error('Please enter ingredients or record your voice');
    }
  };
  
  return (
    <div className="card p-4">
      <h2 className="text-xl font-bold mb-3 text-carnivore-foreground">What ingredients do you have?</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (e.g. beef, salt, butter)"
          className="input-field min-h-[100px] resize-none"
          disabled={isRecording || isTranscribing}
        />
        
        {recordingError && (
          <p className="text-red-500 text-sm">{recordingError}</p>
        )}
        
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors disabled:opacity-50"
              disabled={isTranscribing}
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stopRecording}
                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={handleCancelRecording}
                className="bg-carnivore-muted text-carnivore-secondary p-3 rounded-full hover:text-carnivore-primary transition-colors"
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
        </div>
      </form>
    </div>
  );
};

export default IngredientInput;
