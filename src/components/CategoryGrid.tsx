
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
  
  // For mobile, display all categories in a 3x2 grid
  // No longer limiting to just 4 on mobile
  const displayCategories = categories;
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4'}`}>
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="bg-carnivore-card border border-carnivore-muted rounded-lg p-3 flex flex-col items-center justify-center text-center hover:border-carnivore-primary transition-colors hover:bg-carnivore-muted/20"
          >
            <div className="text-carnivore-secondary mb-2">{category.icon}</div>
            <span className="font-medium">{category.name}</span>
            {(!isMobile || true) && (
              <p className="text-xs text-carnivore-secondary mt-1 line-clamp-2">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
