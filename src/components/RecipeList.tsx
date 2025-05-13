
import React from 'react';
import RecipeCard from './RecipeCard';
import { useIsMobile } from '../hooks/use-mobile';
import type { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  title: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, title }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className={`grid grid-cols-1 ${isMobile ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'} gap-4`}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} compact={isMobile} />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
