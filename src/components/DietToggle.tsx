
import React from 'react';

interface DietToggleProps {
  selectedDiet: 'strict' | 'flexible';
  onChange: (diet: 'strict' | 'flexible') => void;
}

const DietToggle: React.FC<DietToggleProps> = ({ selectedDiet, onChange }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-medium mb-3 text-center">Diet Preference</h3>
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
          Strict
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
          Flexible
        </button>
      </div>
    </div>
  );
};

export default DietToggle;
