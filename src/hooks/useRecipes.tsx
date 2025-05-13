
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Recipe } from '../types';
import { toast } from './use-toast';

// Convert Supabase recipe to app recipe format
const convertSupabaseRecipe = (supabaseRecipe: any): Recipe => {
  return {
    id: supabaseRecipe.id,
    name: supabaseRecipe.name,
    image: supabaseRecipe.image_url,
    ingredients: supabaseRecipe.ingredients,
    instructions: supabaseRecipe.instructions,
    dietType: supabaseRecipe.diet_type,
    category: supabaseRecipe.category,
    prepTime: supabaseRecipe.prep_time,
    macros: supabaseRecipe.macros,
    cookingMethod: supabaseRecipe.macros?.cooking_method
  };
};

// Convert app recipe to Supabase format
const convertToSupabaseRecipe = (recipe: Omit<Recipe, 'id'>): any => {
  return {
    name: recipe.name,
    image_url: recipe.image,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    diet_type: recipe.dietType,
    category: recipe.category,
    prep_time: recipe.prepTime,
    macros: {
      protein: recipe.macros?.protein || 0,
      fat: recipe.macros?.fat || 0,
      carbs: recipe.macros?.carbs || 0,
      cooking_method: recipe.cookingMethod
    }
  };
};

export function useRecipes() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all recipes
  const getAllRecipes = async (): Promise<Recipe[]> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(convertSupabaseRecipe);
  };

  // Get recipes by category
  const getRecipesByCategory = async (category: string): Promise<Recipe[]> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(convertSupabaseRecipe);
  };

  // Get recipe by id
  const getRecipeById = async (id: string): Promise<Recipe> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Recipe not found');
    
    return convertSupabaseRecipe(data);
  };

  // Create recipe
  const createRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      const supabaseRecipe = convertToSupabaseRecipe(recipe);
      
      // Add user_id if user is authenticated
      if (user?.user?.id) {
        supabaseRecipe.user_id = user.user.id;
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert(supabaseRecipe)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return convertSupabaseRecipe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: "Receita criada",
        description: "Sua receita foi criada com sucesso!"
      });
    },
    onError: (err: Error) => {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao criar receita",
        description: err.message || "Ocorreu um erro ao criar a receita"
      });
    }
  });

  // Update recipe
  const updateRecipe = useMutation({
    mutationFn: async ({ id, recipe }: { id: string; recipe: Omit<Recipe, 'id'> }) => {
      const { data, error } = await supabase
        .from('recipes')
        .update(convertToSupabaseRecipe(recipe))
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return convertSupabaseRecipe(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.id] });
      toast({
        title: "Receita atualizada",
        description: "Sua receita foi atualizada com sucesso!"
      });
    },
    onError: (err: Error) => {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar receita",
        description: err.message || "Ocorreu um erro ao atualizar a receita"
      });
    }
  });

  // Delete recipe
  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: "Receita excluída",
        description: "Sua receita foi excluída com sucesso!"
      });
    },
    onError: (err: Error) => {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir receita",
        description: err.message || "Ocorreu um erro ao excluir a receita"
      });
    }
  });

  return {
    getAllRecipes,
    getRecipesByCategory,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    error,
    setError
  };
}

// Function to handle audio transcription using OpenAI Whisper API
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  console.log('Starting audio transcription process');
  
  // Validate the audio blob
  if (!audioBlob || audioBlob.size === 0) {
    console.error('Invalid audio recording: Empty file');
    throw new Error('Gravação inválida: Arquivo vazio ou corrompido');
  }
  
  if (audioBlob.size < 100) {
    console.error('Audio file too small:', audioBlob.size, 'bytes');
    throw new Error('Gravação muito curta. Por favor, fale por mais tempo.');
  }
  
  // Make sure we're using a format that OpenAI's API accepts
  const validFormats = /(wav|mp3|ogg|m4a|mp4|mpeg|mpga|webm)/i;
  const mimeType = audioBlob.type || 'audio/webm';
  
  if (!mimeType.match(validFormats)) {
    console.error(`Unsupported audio format: ${mimeType}`);
    throw new Error(`Formato de áudio não suportado: ${mimeType}. Use WAV, MP3, OGG, M4A, MP4, MPEG ou WEBM.`);
  }
  
  console.log(`Preparing audio for transcription: type=${mimeType}, size=${audioBlob.size} bytes`);
  
  const formData = new FormData();
  
  // Determine appropriate filename extension based on the MIME type
  let filename = 'recording.webm';
  if (mimeType.includes('mp3')) filename = 'recording.mp3';
  else if (mimeType.includes('wav')) filename = 'recording.wav';
  else if (mimeType.includes('ogg')) filename = 'recording.ogg';
  else if (mimeType.includes('mp4')) filename = 'recording.mp4';
  
  console.log(`Using filename: ${filename}`);
  formData.append('audio', audioBlob, filename);

  // Using the anon key from the environment
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnVqcWlkaGpuYm9zZmN3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODUyOTAsImV4cCI6MjA2MDY2MTI5MH0.LJX5gVpgj34euLc-mXkoPVVZK7eG9k_LBzCED8jN9Ls";
  const SUPABASE_URL = "https://nuvujqidhjnbosfcwahw.supabase.co";

  console.log("Sending request to transcribe-audio edge function");
  
  try {
    // Important: Do NOT set Content-Type header manually, let the browser set it with the boundary
    const response = await fetch(`${SUPABASE_URL}/functions/v1/transcribe-audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        // Content-Type is NOT set manually - let the browser handle it
      },
      body: formData,
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `Erro de transcrição: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `Erro de transcrição: ${errorData.error || response.statusText}`;
        console.error('Transcription error response:', errorData);
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Transcription success response:', data);
    
    if (!data.text || data.text.trim() === '') {
      console.error('No transcription text returned');
      throw new Error('Nenhum texto foi identificado na gravação. Por favor, fale mais claramente.');
    }
    
    // Success! Return the transcript
    console.log('Transcription successful:', data.text);
    return data.text;
  } catch (error: any) {
    console.error('Error during transcription request:', error);
    throw new Error(`Falha na transcrição: ${error.message || 'Erro desconhecido'}`);
  }
};

// Function to generate recipe image
export const generateRecipeImage = async (recipeName: string): Promise<string> => {
  console.log('Generating recipe image for:', recipeName);
  
  try {
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnVqcWlkaGpuYm9zZmN3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODUyOTAsImV4cCI6MjA2MDY2MTI5MH0.LJX5gVpgj34euLc-mXkoPVVZK7eG9k_LBzCED8jN9Ls";
    
    const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt: recipeName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na geração de imagem: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error: any) {
    console.error('Image generation error:', error);
    toast({
      variant: "destructive",
      title: "Erro na geração de imagem",
      description: error.message || "Não foi possível gerar a imagem da receita"
    });
    
    // Return empty string on error so app can continue without image
    return '';
  }
};

// Function to generate recipe from ingredients
export const generateRecipe = async (ingredients: string, dietType: 'strict' | 'flexible'): Promise<Recipe> => {
  console.log('Generating recipe with ingredients:', ingredients);
  console.log('Diet type:', dietType);
  
  // Get the anon key for authentication
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnVqcWlkaGpuYm9zZmN3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODUyOTAsImV4cCI6MjA2MDY2MTI5MH0.LJX5gVpgj34euLc-mXkoPVVZK7eG9k_LBzCED8jN9Ls";
  
  try {
    const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/generate-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ ingredients, dietType }),
    });

    if (!response.ok) {
      let errorMessage = 'Falha na geração da receita';
      try {
        const errorData = await response.json();
        console.error('Recipe generation error response:', errorData);
        errorMessage = `Erro na geração da receita: ${errorData.error || response.statusText}`;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    toast({
      title: "Receita gerada",
      description: `"${data.name}" foi criada com sucesso!`
    });
    
    return {
      id: '',
      name: data.name,
      ingredients: data.ingredients,
      instructions: data.instructions,
      dietType: data.dietType,
      category: data.category,
      prepTime: data.prepTime,
      macros: data.macros,
      cookingMethod: data.cookingMethod || 'pan',
      image: '' // We'll set this later if needed
    };
  } catch (error: any) {
    console.error('Recipe generation error:', error);
    toast({
      variant: "destructive",
      title: "Erro na geração de receita",
      description: error.message || "Não foi possível gerar a receita"
    });
    throw error;
  }
};

// Function to process image for OCR
export const processImageOCR = async (imageUrl: string): Promise<any> => {
  console.log('Processing image for OCR:', imageUrl);
  
  try {
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnVqcWlkaGpuYm9zZmN3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODUyOTAsImV4cCI6MjA2MDY2MTI5MH0.LJX5gVpgj34euLc-mXkoPVVZK7eG9k_LBzCED8jN9Ls";
    
    const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/process-image-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro de OCR: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('OCR processing error:', error);
    toast({
      variant: "destructive",
      title: "Erro no processamento OCR",
      description: error.message || "Não foi possível processar a imagem"
    });
    throw error;
  }
};
