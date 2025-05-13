
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Menu } from 'lucide-react';
import Header from '../components/Header';
import IngredientInput from '../components/IngredientInput';
import DietToggle from '../components/DietToggle';
import CategoryGrid from '../components/CategoryGrid';
import RecipeList from '../components/RecipeList';
import type { Recipe } from '../types';

const exampleRecipes: Recipe[] = [
  {
    id: 'steak-eggs',
    name: 'Pan-Seared Steak with Fried Eggs',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    ingredients: ['300g ribeye steak', '2 eggs', 'Sea salt', '1 tbsp butter'],
    instructions: [
      'Season steak with salt',
      'Sear on high heat for 3-4 minutes per side',
      'Let rest',
      'Fry eggs in the same pan',
      'Serve together'
    ],
    macros: {
      protein: 45,
      fat: 36,
      carbs: 1
    },
    dietType: 'strict',
    category: 'pan-classics',
    prepTime: 15
  },
  {
    id: 'ribeye-butter',
    name: 'Butter-Basted Ribeye',
    image: 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    ingredients: ['400g ribeye steak', 'Sea salt', '3 tbsp butter', 'Rosemary', 'Garlic'],
    instructions: [
      'Season ribeye generously with salt',
      'Cook in cast iron on high heat for 2 minutes each side',
      'Add butter, rosemary and garlic',
      'Baste continuously for 3-4 minutes',
      'Rest for 5-10 minutes before serving'
    ],
    macros: {
      protein: 52,
      fat: 48,
      carbs: 0
    },
    dietType: 'strict',
    category: 'quick-grill',
    prepTime: 20
  }
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [dietType, setDietType] = useState<'strict' | 'flexible'>('strict');
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  
  useEffect(() => {
    // In a real app, we would fetch from API
    // For now, we'll just use local storage for demo purposes
    const storedRecipes = localStorage.getItem('carnivoreRecipes');
    if (storedRecipes) {
      setSavedRecipes(JSON.parse(storedRecipes));
    }
  }, []);

  const handleIngredientSubmit = (ingredients: string) => {
    // In a real app, we would call an API with the ingredients and dietType
    console.log('Searching for recipes with:', ingredients, 'Diet type:', dietType);
    // For now, we'll navigate to the example recipe
    navigate('/recipe/steak-eggs');
  };

  return (
    <div className="leather-bg min-h-screen pb-20">
      <Header />
      
      <div className="container max-w-2xl px-4 py-8">
        <IngredientInput onSubmit={handleIngredientSubmit} />
        
        <div className="mt-8">
          <DietToggle selectedDiet={dietType} onChange={setDietType} />
        </div>
        
        <CategoryGrid />
        
        {(savedRecipes.length > 0 || exampleRecipes.length > 0) && (
          <RecipeList 
            title="Your Recipes" 
            recipes={savedRecipes.length > 0 ? savedRecipes : exampleRecipes} 
          />
        )}
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
