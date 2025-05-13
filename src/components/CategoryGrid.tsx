
import React from 'react';
import { ChefHat, Egg, Utensils, Beef, Flame, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';

const categories = [
  {
    id: 'quick-grill',
    name: 'Quick Grills',
    icon: <Utensils className="h-8 w-8" />,
    description: 'Fast and easy grilled recipes'
  },
  {
    id: 'carnivore-breakfast',
    name: 'Breakfast',
    icon: <Egg className="h-8 w-8" />,
    description: 'Start your day with protein'
  },
  {
    id: 'bbq',
    name: 'Barbecue',
    icon: <Beef className="h-8 w-8" />,
    description: 'Slow cooked and smoked dishes'
  },
  {
    id: 'offal',
    name: 'Offal',
    icon: <ChefHat className="h-8 w-8" />,
    description: 'Nutritious organ meat recipes'
  },
  {
    id: 'slow-cook',
    name: 'Slow Cook',
    icon: <Flame className="h-8 w-8" />,
    description: 'Low and slow carnivore dishes'
  },
  {
    id: 'seafood',
    name: 'Seafood',
    icon: <Fish className="h-8 w-8" />,
    description: 'Fish and seafood specialties'
  }
];

const CategoryGrid: React.FC = () => {
  const isMobile = useIsMobile();
  
  // For mobile, only show 4 categories
  const displayCategories = isMobile ? categories.slice(0, 4) : categories;
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className={`grid grid-cols-2 ${isMobile ? 'sm:grid-cols-4' : 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'} gap-4`}>
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="bg-carnivore-card border border-carnivore-muted rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-carnivore-primary transition-colors hover:bg-carnivore-muted/20"
          >
            <div className="text-carnivore-secondary mb-2">{category.icon}</div>
            <span className="font-medium">{category.name}</span>
            {!isMobile && (
              <p className="text-xs text-carnivore-secondary mt-1">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
