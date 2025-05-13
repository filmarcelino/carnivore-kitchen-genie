
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

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Use GPT-4o with vision capabilities to extract recipe info from the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: 'system', 
            content: `You are a recipe OCR system. Extract the complete recipe from the image, including:
            1. Recipe name/title
            2. All ingredients with quantities
            3. All preparation instructions
            4. Any other recipe details like prep time, cooking method, etc.
            
            Format your response as JSON:
            {
              "name": "Recipe Name",
              "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
              "instructions": ["step 1", "step 2", ...],
              "prepTime": estimated preparation time in minutes (if visible),
              "notes": "any other details from the recipe"
            }`
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Extract the recipe from this image:' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const recipeData = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(recipeData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-image-ocr function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
