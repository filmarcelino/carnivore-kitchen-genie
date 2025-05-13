
import React from 'react';
import RecipeCard from './RecipeCard';
import type { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  title: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, title }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} compact />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
