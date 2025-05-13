
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Check for both possible API key environment variable names
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

  try {
    // Log the API key status (not the actual key)
    console.log(`OpenAI API key available: ${openAIApiKey ? 'Yes' : 'No'}`);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found. Please check OPENAI_API_KEY or OPEN_API_KEY environment variable.');
    }

    const { ingredients, dietType } = await req.json();
    console.log(`Received request with ingredients: ${ingredients ? 'Yes' : 'No'}, dietType: ${dietType || 'Not specified'}`);

    if (!ingredients) {
      throw new Error('Ingredients are required');
    }

    const systemPrompt = `You are a specialized carnivore diet recipe creator. 
    Create a recipe using only the ingredients provided, focusing on animal products.
    ${dietType === 'strict' ? 'Use only animal products in the recipe.' : 'You can include minimal plant ingredients for flavor if needed.'} 
    Return the recipe in JSON format with the following structure:
    {
      "name": "Recipe Name",
      "category": "one of: quick-grill, carnivore-breakfast, bbq, offal, pan-classics",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "prepTime": estimated preparation time in minutes,
      "dietType": "${dietType}",
      "macros": {
        "protein": estimated grams,
        "fat": estimated grams,
        "carbs": estimated grams
      }
    }`;

    console.log("Sending request to OpenAI API...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a carnivore recipe using these ingredients: ${ingredients}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", JSON.stringify(errorData));
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Received response from OpenAI API");
    
    try {
      const recipeJson = JSON.parse(data.choices[0].message.content);
      console.log("Successfully parsed recipe JSON");
      
      return new Response(JSON.stringify(recipeJson), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing recipe JSON:", parseError);
      throw new Error(`Failed to parse recipe data: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
