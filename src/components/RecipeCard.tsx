
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, compact = false }) => {
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'quick-grill': return 'Quick Grill';
      case 'carnivore-breakfast': return 'Breakfast';
      case 'bbq': return 'Barbecue';
      case 'offal': return 'Offal';
      case 'pan-classics': return 'Pan Classics';
      default: return category;
    }
  };

  return (
    <Link to={`/recipe/${recipe.id}`} className="block">
      <div className={`card transition-transform duration-200 hover:scale-[1.02] ${compact ? 'h-full' : ''}`}>
        <div className="relative h-44 bg-carnivore-muted">
          {recipe.image ? (
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-carnivore-muted">
              <span className="text-carnivore-secondary">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <button className="p-1.5 rounded-full bg-carnivore-background/70 text-carnivore-secondary hover:text-carnivore-primary transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-carnivore-background/90 to-transparent p-3">
            <span className="px-2 py-1 text-xs rounded-full bg-carnivore-primary text-white">
              {recipe.dietType === 'strict' ? 'Strict' : 'Flexible'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{recipe.name}</h3>
          </div>
          {!compact && (
            <p className="text-carnivore-secondary text-sm mb-3">
              {getCategoryName(recipe.category)}
              {recipe.prepTime && (
                <span className="flex items-center mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{recipe.prepTime} min</span>
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
