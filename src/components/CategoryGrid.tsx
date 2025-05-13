
import React from 'react';
import { ChefHat, Egg, Utensils, Beef } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'quick-grill',
    name: 'Quick Grills',
    icon: <Utensils className="h-8 w-8" />,
  },
  {
    id: 'carnivore-breakfast',
    name: 'Breakfast',
    icon: <Egg className="h-8 w-8" />,
  },
  {
    id: 'bbq',
    name: 'Barbecue',
    icon: <Beef className="h-8 w-8" />,
  },
  {
    id: 'offal',
    name: 'Offal',
    icon: <ChefHat className="h-8 w-8" />,
  }
];

const CategoryGrid: React.FC = () => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="bg-carnivore-card border border-carnivore-muted rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-carnivore-primary transition-colors"
          >
            <div className="text-carnivore-secondary mb-2">{category.icon}</div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
