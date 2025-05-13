
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import RecipeForm from '../components/RecipeForm';
import type { Recipe } from '../types';

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (recipe: Omit<Recipe, 'id'>) => {
    // In a real app, we would save the recipe to a database
    // For now, we'll just mock this and navigate back
    const newRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
    };
    
    // Example of how we would save to local storage
    const existingRecipes = JSON.parse(localStorage.getItem('carnivoreRecipes') || '[]');
    const updatedRecipes = [...existingRecipes, newRecipe];
    localStorage.setItem('carnivoreRecipes', JSON.stringify(updatedRecipes));
    
    toast.success('Recipe created successfully!');
    navigate('/');
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
