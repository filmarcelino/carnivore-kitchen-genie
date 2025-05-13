
import React, { useState } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import DietToggle from './DietToggle';
import type { Recipe, RecipeCategory } from '../types';

interface RecipeFormProps {
  onSubmit: (recipe: Omit<Recipe, 'id'>) => void;
  initialData?: Partial<Recipe>;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [dietType, setDietType] = useState<'strict' | 'flexible'>(initialData?.dietType || 'strict');
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || ['']);
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || ['']);
  const [category, setCategory] = useState<RecipeCategory>(initialData?.category || 'quick-grill');
  const [image, setImage] = useState<string | undefined>(initialData?.image);
  const [prepTime, setPrepTime] = useState<number | undefined>(initialData?.prepTime);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredIngredients = ingredients.filter(i => i.trim() !== '');
    const filteredInstructions = instructions.filter(i => i.trim() !== '');
    
    onSubmit({
      name,
      dietType,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      category,
      image,
      prepTime,
      macros: {
        protein: 0,
        fat: 0,
        carbs: 0
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="recipe-image" className="block text-carnivore-foreground mb-2">
          Recipe Image
        </label>
        <div className="h-60 bg-carnivore-muted rounded-lg flex items-center justify-center cursor-pointer">
          {image ? (
            <div className="relative w-full h-full">
              <img src={image} alt="Recipe" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-carnivore-background/80 p-1 rounded-full text-carnivore-primary hover:bg-carnivore-background transition-colors"
                onClick={() => setImage(undefined)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-carnivore-secondary">
              <Camera className="h-10 w-10 mb-2" />
              <span>Add Photo</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-carnivore-foreground mb-2">
          Recipe Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter recipe name"
          className="input-field w-full"
          required
        />
      </div>

      <div>
        <label className="block text-carnivore-foreground mb-2">
          Diet Type
        </label>
        <DietToggle selectedDiet={dietType} onChange={setDietType} />
      </div>

      <div>
        <label htmlFor="category" className="block text-carnivore-foreground mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as RecipeCategory)}
          className="input-field w-full"
        >
          <option value="quick-grill">Quick Grill</option>
          <option value="carnivore-breakfast">Breakfast</option>
          <option value="bbq">Barbecue</option>
          <option value="offal">Offal</option>
          <option value="pan-classics">Pan Classics</option>
        </select>
      </div>

      <div>
        <label htmlFor="prep-time" className="block text-carnivore-foreground mb-2">
          Preparation Time (minutes)
        </label>
        <input
          id="prep-time"
          type="number"
          min="1"
          value={prepTime || ''}
          onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Enter preparation time"
          className="input-field w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-carnivore-foreground">
            Ingredients
          </label>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="text-carnivore-primary hover:text-carnivore-accent flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder="Enter ingredient"
                className="input-field w-full"
              />
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="p-2 bg-carnivore-muted text-carnivore-secondary rounded-lg hover:text-carnivore-primary transition-colors"
                disabled={ingredients.length <= 1}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-carnivore-foreground">
            Instructions
          </label>
          <button
            type="button"
            onClick={handleAddInstruction}
            className="text-carnivore-primary hover:text-carnivore-accent flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="input-field w-full resize-none h-24"
              />
              <button
                type="button"
                onClick={() => handleRemoveInstruction(index)}
                className="p-2 h-fit bg-carnivore-muted text-carnivore-secondary rounded-lg hover:text-carnivore-primary transition-colors"
                disabled={instructions.length <= 1}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Save Recipe
      </button>
    </form>
  );
};

export default RecipeForm;
