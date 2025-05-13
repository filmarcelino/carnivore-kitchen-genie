
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import RecipeForm from '../components/RecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import { useQuery } from '@tanstack/react-query';
import type { Recipe } from '../types';

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, updateRecipe } = useRecipes();

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required');
      return await getRecipeById(id);
    },
  });

  const handleSubmit = (updatedRecipe: Omit<Recipe, 'id'>) => {
    if (!id) return;
    
    updateRecipe.mutate(
      { id, recipe: updatedRecipe },
      {
        onSuccess: () => {
          toast.success('Recipe updated successfully!');
          navigate(`/recipe/${id}`);
        },
        onError: (error) => {
          toast.error(`Error updating recipe: ${error.message}`);
        }
      }
    );
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
            <p className="text-carnivore-secondary mb-6">The recipe you're trying to edit doesn't exist.</p>
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
    <div className="leather-bg min-h-screen pb-16">
      <Header />
      <div className="container max-w-2xl px-4 py-8">
        <button
          onClick={() => navigate(`/recipe/${id}`)}
          className="flex items-center text-carnivore-secondary hover:text-carnivore-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Recipe
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
        
        <RecipeForm onSubmit={handleSubmit} initialData={recipe} />
      </div>
    </div>
  );
};

export default EditRecipe;
