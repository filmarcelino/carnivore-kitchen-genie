
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Check for API key in both possible environment variable names
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Log the request to help with debugging
  console.log('Received transcribe-audio request');
  console.log('Request headers:', Object.fromEntries([...req.headers.entries()]));
  
  try {
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured. Checked both OPENAI_API_KEY and OPEN_API_KEY');
      throw new Error('OpenAI API key is not configured in the environment. Please check Supabase secrets configuration.');
    }

    console.log('API key found, proceeding with transcription');

    // Double check Content-Type header
    const contentType = req.headers.get('content-type');
    console.log('Content-Type header:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Invalid Content-Type header:', contentType);
      throw new Error('Invalid Content-Type. Must be multipart/form-data');
    }

    const formData = await req.formData().catch(error => {
      console.error('Error parsing form data:', error);
      throw new Error('Failed to parse form data: ' + error.message);
    });
    
    const audioFile = formData.get('audio');
    
    if (!audioFile || !(audioFile instanceof File)) {
      console.error('Audio file is missing or invalid');
      throw new Error('Audio file is required');
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });
    
    if (audioFile.size === 0) {
      console.error('Audio file is empty');
      throw new Error('Audio file is empty');
    }

    if (audioFile.size < 100) {
      console.error('Audio file is too small');
      throw new Error('Audio recording is too short. Please speak longer.');
    }

    // Determine file extension and appropriate MIME type
    let correctExtension = 'webm';
    let correctMimeType = 'audio/webm';
    
    if (audioFile.type.includes('mp3')) {
      correctExtension = 'mp3';
      correctMimeType = 'audio/mpeg';
    } else if (audioFile.type.includes('wav')) {
      correctExtension = 'wav';
      correctMimeType = 'audio/wav';
    } else if (audioFile.type.includes('ogg')) {
      correctExtension = 'ogg';
      correctMimeType = 'audio/ogg';
    } else if (audioFile.type.includes('mp4')) {
      correctExtension = 'mp4';
      correctMimeType = 'audio/mp4';
    }

    // Create a FormData object for the OpenAI API
    const openaiFormData = new FormData();
    
    // Process the audio file with the correct extension
    const fileBuffer = await audioFile.arrayBuffer();
    const processedAudioFile = new File(
      [fileBuffer], 
      `recording.${correctExtension}`, 
      { type: correctMimeType }
    );
    
    openaiFormData.append('file', processedAudioFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'en'); // Changed from 'pt' to 'en' for English

    console.log('Sending request to OpenAI');
    console.log('Audio being sent:', {
      filename: processedAudioFile.name,
      type: processedAudioFile.type,
      size: processedAudioFile.size
    });
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openaiFormData,
    });

    const responseText = await response.text();
    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `OpenAI API error: Status ${response.status}`;
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('OpenAI API error details:', errorData);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        console.error('Raw error response:', responseText);
        errorMessage += ` - ${responseText.substring(0, 200)}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse the JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Transcription successful');
      
      if (!data.text || data.text.trim() === '') {
        console.error('Empty transcription returned');
        throw new Error('No speech detected. Please try speaking more clearly.');
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse OpenAI response');
    }
    
    return new Response(JSON.stringify({ text: data.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
