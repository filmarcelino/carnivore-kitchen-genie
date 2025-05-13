
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
    const { ingredients, dietType } = await req.json();

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
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const recipeJson = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(recipeJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
