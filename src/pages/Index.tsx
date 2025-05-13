
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, Search, Plus, Menu, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Header from '../components/Header';
import IngredientInput from '../components/IngredientInput';
import DietToggle from '../components/DietToggle';
import CategoryGrid from '../components/CategoryGrid';
import RecipeList from '../components/RecipeList';
import { useQuery } from '@tanstack/react-query';
import { useRecipes, generateRecipe } from '../hooks/useRecipes';
import { supabase } from '../integrations/supabase/client';
import { useIsMobile } from '../hooks/use-mobile';
import DesktopLayout from '../components/DesktopLayout';
import type { Recipe } from '../types';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const [dietType, setDietType] = useState<'strict' | 'flexible'>('strict');
  const [isGenerating, setIsGenerating] = useState(false);
  const { getAllRecipes, getRecipesByCategory } = useRecipes();
  const isMobile = useIsMobile();

  // Check for secure context
  const [isSecureContext, setIsSecureContext] = useState<boolean>(true);
  
  useEffect(() => {
    const secure = window.isSecureContext || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    setIsSecureContext(secure);
    
    if (!secure) {
      console.warn('Application is not running in a secure context. Some features may be limited.');
      toast({
        variant: "destructive", 
        title: "Security Warning", 
        description: "This app should be accessed via HTTPS for all features to work properly."
      });
    }
  }, []);

  // Fetch recipes based on category or all recipes
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', category],
    queryFn: async () => {
      if (category) {
        return await getRecipesByCategory(category);
      } else {
        return await getAllRecipes();
      }
    },
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
      toast({
        variant: "destructive",
        title: "Empty Ingredients",
        description: "Please enter some ingredients"
      });
      return;
    }

    console.log('Submitting ingredients for recipe generation:', ingredients);
    console.log('Diet type:', dietType);

    try {
      setIsGenerating(true);
      
      toast({
        title: "Generating Recipe",
        description: "Please wait while we create your recipe..."
      });
      
      const generatedRecipe = await generateRecipe(ingredients, dietType);
      console.log('Recipe generated successfully:', generatedRecipe);
      
      // Store the generated recipe in local storage
      const generatedRecipes = {
        ...generatedRecipe,
        id: `temp-${Date.now()}`
      };
      localStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipes));
      
      toast({
        title: "Recipe Created!",
        description: `Your ${generatedRecipe.name} recipe is ready.`
      });
      
      // Navigate to view the recipe
      navigate(`/recipe/${generatedRecipes.id}`);
    } catch (error: any) {
      console.error('Recipe generation error:', error);
      toast({
        variant: "destructive",
        title: "Recipe Generation Failed",
        description: error.message || "Failed to generate recipe. Please try again."
      });
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

  // For Desktop Layout
  if (!isMobile) {
    return (
      <DesktopLayout session={session}>
        <Header />
        
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {!isSecureContext && (
                <div className="mb-4 bg-yellow-100 border border-yellow-400 p-4 rounded-md">
                  <h3 className="font-semibold text-yellow-800">HTTPS Required</h3>
                  <p className="text-yellow-700 text-sm">
                    Voice recording requires HTTPS. Some features may be limited in this environment.
                  </p>
                </div>
              )}
              
              <IngredientInput onSubmit={handleIngredientSubmit} />
              
              <div className="mt-6">
                <DietToggle selectedDiet={dietType} onChange={setDietType} />
              </div>
              
              {isGenerating && (
                <div className="mt-6 flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-carnivore-primary animate-spin mb-2" />
                  <p className="text-carnivore-secondary">Generating recipe...</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <CategoryGrid />
              
              {(recipes && recipes.length > 0) ? (
                <RecipeList 
                  title={category 
                    ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Recipes` 
                    : (session ? "Your Recipes" : "Example Recipes")
                  } 
                  recipes={recipes} 
                />
              ) : (
                <div className="mt-8 text-center p-8 bg-carnivore-card rounded-xl">
                  <p className="text-carnivore-secondary">No recipes found. Try creating one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DesktopLayout>
    );
  }

  // Original Mobile Layout
  return (
    <div className="leather-bg min-h-screen pb-20">
      <Header />
      
      <div className="container max-w-2xl px-4 py-8">
        {!isSecureContext && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 p-4 rounded-md">
            <h3 className="font-semibold text-yellow-800">HTTPS Required</h3>
            <p className="text-yellow-700 text-sm">
              Voice recording requires HTTPS. Some features may be limited in this environment.
            </p>
          </div>
        )}
        
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
            title={category ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Recipes` : (session ? "Your Recipes" : "Example Recipes")} 
            recipes={recipes} 
          />
        ) : (
          <div className="mt-12 text-center">
            <p className="text-carnivore-secondary">No recipes found. Try creating one!</p>
          </div>
        )}
      </div>
      
      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-carnivore-card border-t border-carnivore-muted">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/')}
            className={`py-4 px-6 flex flex-col items-center ${!category ? 'text-carnivore-primary' : 'text-carnivore-secondary'}`}
          >
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
          <button 
            onClick={() => navigate(session ? '/profile' : '/auth')}
            className="py-4 px-6 text-carnivore-secondary flex flex-col items-center"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">{session ? 'Profile' : 'Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
