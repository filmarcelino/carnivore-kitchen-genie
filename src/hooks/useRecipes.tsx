import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Recipe } from '../types';

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
    },
    onError: (err: Error) => {
      setError(err.message);
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
    },
    onError: (err: Error) => {
      setError(err.message);
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
    },
    onError: (err: Error) => {
      setError(err.message);
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
  // Validate the audio blob
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio recording: Empty or corrupt file');
  }
  
  // Make sure we're using a format that OpenAI's API accepts
  const validFormats = /(wav|mp3|ogg|m4a|mp4|mpeg|mpga|webm)/i;
  const mimeType = audioBlob.type || 'audio/webm';
  
  if (!mimeType.match(validFormats)) {
    console.error(`Unsupported audio format: ${mimeType}`);
    throw new Error(`Unsupported audio format: ${mimeType}. Please use WAV, MP3, OGG, M4A, MP4, MPEG, or WEBM.`);
  }
  
  console.log(`Preparing audio for transcription: type=${mimeType}, size=${audioBlob.size} bytes`);
  
  const formData = new FormData();
  
  // Determine appropriate filename extension based on the MIME type
  let filename = 'recording.webm';
  if (mimeType.includes('mp3')) filename = 'recording.mp3';
  else if (mimeType.includes('wav')) filename = 'recording.wav';
  else if (mimeType.includes('ogg')) filename = 'recording.ogg';
  
  console.log(`Using filename: ${filename}`);
  formData.append('audio', audioBlob, filename);

  // Using the anon key from the environment
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dnVqcWlkaGpuYm9zZmN3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODUyOTAsImV4cCI6MjA2MDY2MTI5MH0.LJX5gVpgj34euLc-mXkoPVVZK7eG9k_LBzCED8jN9Ls";

  console.log("Sending request to transcribe-audio edge function");
  
  try {
    const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/transcribe-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: formData,
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Transcription error response:', errorData);
      throw new Error(`Transcription error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Transcription success:', data);
    return data.text;
  } catch (error) {
    console.error('Error during transcription request:', error);
    throw error;
  }
};

// Function to generate recipe image
export const generateRecipeImage = async (recipeName: string): Promise<string> => {
  const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: recipeName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Image generation error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl;
};

// Function to generate recipe from ingredients
export const generateRecipe = async (ingredients: string, dietType: 'strict' | 'flexible'): Promise<Recipe> => {
  const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/generate-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients, dietType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Recipe generation error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return {
    id: '',
    name: data.name,
    ingredients: data.ingredients,
    instructions: data.instructions,
    dietType: data.dietType,
    category: data.category,
    prepTime: data.prepTime,
    macros: data.macros,
    cookingMethod: data.cookingMethod || 'pan'
  };
};

// Function to process image for OCR
export const processImageOCR = async (imageUrl: string): Promise<any> => {
  const response = await fetch('https://nuvujqidhjnbosfcwahw.supabase.co/functions/v1/process-image-ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OCR error: ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  return data;
};
