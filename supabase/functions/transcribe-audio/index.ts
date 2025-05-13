
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error('Audio file is required');
    }

    console.log('Audio file received, size:', audioFile.size, 'type:', audioFile.type);
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    // Create a FormData object for the OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'whisper-1');

    console.log('Sending request to OpenAI');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Transcription successful');
    
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
