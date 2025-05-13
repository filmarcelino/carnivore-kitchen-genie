
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface DietToggleProps {
  selectedDiet: 'strict' | 'flexible';
  onChange: (diet: 'strict' | 'flexible') => void;
}

const DietToggle: React.FC<DietToggleProps> = ({ selectedDiet, onChange }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-medium mb-3">Diet Preference</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('strict')}
          className={`py-3 px-4 rounded-lg border transition-all ${
            selectedDiet === 'strict'
              ? 'bg-carnivore-primary text-white border-carnivore-primary'
              : 'bg-transparent border-carnivore-muted text-carnivore-foreground hover:bg-carnivore-muted/30'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="font-medium">Strict</span>
            {!isMobile && (
              <p className="text-xs mt-1">Only meat-based ingredients</p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange('flexible')}
          className={`py-3 px-4 rounded-lg border transition-all ${
            selectedDiet === 'flexible'
              ? 'bg-carnivore-primary text-white border-carnivore-primary'
              : 'bg-transparent border-carnivore-muted text-carnivore-foreground hover:bg-carnivore-muted/30'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="font-medium">Flexible</span>
            {!isMobile && (
              <p className="text-xs mt-1">Allows some non-animal ingredients</p>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default DietToggle;
