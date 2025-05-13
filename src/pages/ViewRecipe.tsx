
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Share, Heart, Printer } from 'lucide-react';
import Header from '../components/Header';
import type { Recipe } from '../types';

const ViewRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for our first version
  const mockRecipe: Recipe = {
    id: 'steak-eggs',
    name: 'Pan-Seared Steak with Fried Eggs',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    ingredients: [
      '300g ribeye steak',
      '2 eggs',
      'Sea salt to taste',
      '1 tbsp butter'
    ],
    instructions: [
      'Remove the steak from the refrigerator 30 minutes before cooking to bring it to room temperature.',
      'Season the steak generously with sea salt on both sides.',
      'Heat a cast-iron skillet over high heat until very hot.',
      'Add the steak to the dry pan and cook for 3-4 minutes on each side for medium-rare.',
      'Remove the steak and let it rest on a plate.',
      'Lower the heat to medium and add butter to the same pan.',
      'Crack the eggs into the pan and cook until the whites are set but yolks are still runny.',
      'Serve the steak with the eggs on top.'
    ],
    macros: {
      protein: 45,
      fat: 36,
      carbs: 1
    },
    dietType: 'strict',
    category: 'pan-classics',
    prepTime: 15,
    cookingMethod: 'pan'
  };

  useEffect(() => {
    // In a real app, we would fetch from API or local storage
    setTimeout(() => {
      if (id === 'steak-eggs') {
        setRecipe(mockRecipe);
      } else {
        // Try to get from localStorage in our demo
        const storageRecipes = JSON.parse(localStorage.getItem('carnivoreRecipes') || '[]');
        const foundRecipe = storageRecipes.find((r: Recipe) => r.id === id);
        if (foundRecipe) {
          setRecipe(foundRecipe);
        }
      }
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return (
      <div className="leather-bg min-h-screen flex items-center justify-center">
        <div className="text-carnivore-secondary">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
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
            <button 
              onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
              className="btn-secondary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRecipe;
