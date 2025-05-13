
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Menu, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import IngredientInput from '../components/IngredientInput';
import DietToggle from '../components/DietToggle';
import CategoryGrid from '../components/CategoryGrid';
import RecipeList from '../components/RecipeList';
import { useQuery } from '@tanstack/react-query';
import { useRecipes, generateRecipe } from '../hooks/useRecipes';
import { supabase } from '../integrations/supabase/client';
import type { Recipe } from '../types';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [dietType, setDietType] = useState<'strict' | 'flexible'>('strict');
  const [isGenerating, setIsGenerating] = useState(false);
  const { getAllRecipes } = useRecipes();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: getAllRecipes,
  });

  // Check for user authentication
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleIngredientSubmit = async (ingredients: string) => {
    if (!ingredients.trim()) {
      toast.error('Please enter some ingredients');
      return;
    }

    try {
      setIsGenerating(true);
      const generatedRecipe = await generateRecipe(ingredients, dietType);
      
      // Store the generated recipe in local storage
      const generatedRecipes = JSON.parse(localStorage.getItem('generatedRecipe') || 'null') || { 
        ...generatedRecipe,
        id: `temp-${Date.now()}`
      };
      localStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipes));
      
      // Navigate to view the recipe
      navigate(`/recipe/${generatedRecipes.id}`);
    } catch (error) {
      console.error('Recipe generation error:', error);
      toast.error('Failed to generate recipe');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="leather-bg min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-carnivore-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="leather-bg min-h-screen pb-20">
      <Header />
      
      <div className="container max-w-2xl px-4 py-8">
        <IngredientInput onSubmit={handleIngredientSubmit} />
        
        <div className="mt-8">
          <DietToggle selectedDiet={dietType} onChange={setDietType} />
        </div>
        
        <CategoryGrid />
        
        {isGenerating && (
          <div className="mt-8 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-carnivore-primary animate-spin mb-2" />
            <p className="text-carnivore-secondary">Generating recipe...</p>
          </div>
        )}
        
        {(recipes && recipes.length > 0) ? (
          <RecipeList 
            title={session ? "Your Recipes" : "Example Recipes"} 
            recipes={recipes} 
          />
        ) : null}
      </div>
      
      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-carnivore-card border-t border-carnivore-muted">
        <div className="flex justify-around">
          <button className="py-4 px-6 text-carnivore-primary flex flex-col items-center">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="py-4 px-6 text-carnivore-secondary flex flex-col items-center">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button 
            onClick={() => navigate('/create-recipe')}
            className="py-4 px-6 text-carnivore-secondary flex flex-col items-center"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">Create</span>
          </button>
          <button className="py-4 px-6 text-carnivore-secondary flex flex-col items-center">
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
