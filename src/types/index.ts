
export interface Recipe {
  id: string;
  name: string;
  image?: string;
  ingredients: string[];
  instructions: string[];
  macros?: {
    protein: number;
    fat: number;
    carbs: number;
  };
  dietType: 'strict' | 'flexible';
  category: RecipeCategory;
  prepTime?: number; // in minutes
  cookingMethod?: CookingMethod;
}

export type RecipeCategory = 
  | 'quick-grill' 
  | 'carnivore-breakfast' 
  | 'bbq' 
  | 'offal'
  | 'pan-classics';

export type CookingMethod = 
  | 'grill' 
  | 'pan' 
  | 'oven' 
  | 'slow-cook';
