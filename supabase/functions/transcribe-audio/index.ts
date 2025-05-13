
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

    // Create a FormData object for the OpenAI API
    const openaiFormData = new FormData();
    
    // Process the audio file with the correct extension
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase() || 'webm';
    const validExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'mp4', 'mpeg', 'mpga', 'webm'];
    
    // Make sure extension matches type
    let correctExtension = fileExtension;
    if (audioFile.type.includes('webm')) correctExtension = 'webm';
    else if (audioFile.type.includes('mp3')) correctExtension = 'mp3';
    else if (audioFile.type.includes('wav')) correctExtension = 'wav';
    else if (audioFile.type.includes('ogg')) correctExtension = 'ogg';
    
    if (!validExtensions.includes(correctExtension)) {
      console.error(`Invalid file extension: ${correctExtension}`);
      throw new Error(`Unsupported audio format. Supported formats are: ${validExtensions.join(', ')}`);
    }
    
    // Convert the audio to a file with the proper extension
    const fileBuffer = await audioFile.arrayBuffer();
    const processedAudioFile = new File(
      [fileBuffer], 
      `recording.${correctExtension}`, 
      { type: audioFile.type }
    );
    
    openaiFormData.append('file', processedAudioFile);
    openaiFormData.append('model', 'whisper-1');

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
