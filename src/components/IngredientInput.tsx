
import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-3 text-center">
        What ingredients do you have?
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ex.: 300g of steak, eggs, butter..."
            className="input-field w-full pr-12"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-carnivore-secondary hover:text-carnivore-primary transition-colors"
            title="Voice input (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center">
          <Search className="h-5 w-5 mr-2" />
          Find Recipes
        </button>
      </form>
    </div>
  );
};

export default IngredientInput;
