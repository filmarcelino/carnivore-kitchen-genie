
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import RecipeForm from '../components/RecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import type { Recipe } from '../types';

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();

  const handleSubmit = (recipe: Omit<Recipe, 'id'>) => {
    createRecipe.mutate(recipe, {
      onSuccess: (newRecipe) => {
        toast.success('Recipe created successfully!');
        navigate(`/recipe/${newRecipe.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to create recipe: ${error.message}`);
      }
    });
  };

  return (
    <div className="leather-bg min-h-screen pb-16">
      <Header />
      <div className="container max-w-2xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-carnivore-secondary hover:text-carnivore-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        
        <RecipeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateRecipe;
