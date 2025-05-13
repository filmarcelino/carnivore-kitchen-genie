
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Share, Heart, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import { useQuery } from '@tanstack/react-query';
import { useRecipes } from '../hooks/useRecipes';
import { supabase } from '../integrations/supabase/client';

const ViewRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById } = useRecipes();

  // Check if this is a temporary generated recipe
  const isTemporaryRecipe = id?.startsWith('temp-');

  // Get user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch recipe data from Supabase or localStorage for temp recipes
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (isTemporaryRecipe && id) {
        // Get recipe from localStorage for temp recipes
        const tempRecipe = JSON.parse(localStorage.getItem('generatedRecipe') || 'null');
        if (!tempRecipe) throw new Error('Recipe not found');
        return tempRecipe;
      } else if (id) {
        // Get recipe from database
        return await getRecipeById(id);
      }
      throw new Error('Invalid recipe ID');
    },
  });

  const handleSaveRecipe = async () => {
    if (!session) {
      toast.error('You need to log in to save recipes');
      return;
    }

    if (recipe && isTemporaryRecipe) {
      try {
        // Remove the temp ID to let Supabase generate a new one
        const { id, ...recipeWithoutId } = recipe;
        
        // Insert into database
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            ...recipeWithoutId,
            user_id: session.user.id,
            diet_type: recipe.dietType,
            image_url: recipe.image,
            prep_time: recipe.prepTime,
            macros: {
              protein: recipe.macros?.protein || 0,
              fat: recipe.macros?.fat || 0,
              carbs: recipe.macros?.carbs || 0
            }
          })
          .select()
          .single();

        if (error) throw error;

        // Clear temp recipe from localStorage
        localStorage.removeItem('generatedRecipe');

        // Navigate to the newly created recipe
        toast.success('Recipe saved successfully!');
        navigate(`/recipe/${data.id}`);
      } catch (error) {
        console.error('Error saving recipe:', error);
        toast.error('Failed to save recipe');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="leather-bg min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-carnivore-primary animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="leather-bg min-h-screen">
        <Header />
        <div className="container max-w-2xl px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-carnivore-secondary hover:text-carnivore-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to home
          </button>
          
          <div className="mt-12 text-center">
            <h1 className="text-2xl font-bold mb-3">Recipe Not Found</h1>
            <p className="text-carnivore-secondary mb-6">The recipe you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leather-bg min-h-screen">
      <Header />
      
      <div className="relative">
        {recipe.image ? (
          <div className="h-64 sm:h-80 relative">
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carnivore-background to-transparent"></div>
          </div>
        ) : (
          <div className="h-32 bg-carnivore-muted"></div>
        )}
      </div>
      
      <div className="container max-w-2xl px-4 -mt-16 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:text-carnivore-secondary mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{recipe.name}</h1>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-carnivore-muted text-carnivore-secondary hover:text-carnivore-primary transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-carnivore-muted text-carnivore-secondary hover:text-carnivore-primary transition-colors">
                <Share className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-carnivore-muted text-carnivore-secondary hover:text-carnivore-primary transition-colors">
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <span className="px-2 py-1 text-xs rounded-full bg-carnivore-primary text-white mr-3">
              {recipe.dietType === 'strict' ? 'Strict Carnivore' : 'Flexible Carnivore'}
            </span>
            {recipe.prepTime && (
              <span className="text-sm text-carnivore-secondary">
                {recipe.prepTime} min
              </span>
            )}
          </div>
          
          {recipe.macros && (
            <div className="grid grid-cols-3 gap-4 bg-carnivore-muted rounded-lg p-4 mb-6">
              <div className="text-center">
                <span className="block text-xs text-carnivore-secondary">Protein</span>
                <span className="font-medium">{recipe.macros.protein}g</span>
              </div>
              <div className="text-center border-x border-carnivore-card">
                <span className="block text-xs text-carnivore-secondary">Fat</span>
                <span className="font-medium">{recipe.macros.fat}g</span>
              </div>
              <div className="text-center">
                <span className="block text-xs text-carnivore-secondary">Carbs</span>
                <span className="font-medium">{recipe.macros.carbs}g</span>
              </div>
            </div>
          )}
          
          <section className="recipe-section">
            <h2 className="recipe-section-title">Ingredients</h2>
            <ul className="recipe-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </section>
          
          <section className="recipe-section">
            <h2 className="recipe-section-title">Instructions</h2>
            <ol className="recipe-instruction-list">
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </section>
          
          <div className="mt-8 flex justify-center">
            {isTemporaryRecipe ? (
              <button 
                onClick={handleSaveRecipe}
                className="btn-primary flex items-center"
              >
                <Heart className="h-4 w-4 mr-2" />
                Save Recipe
              </button>
            ) : (
              <button 
                onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                className="btn-secondary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Recipe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRecipe;
