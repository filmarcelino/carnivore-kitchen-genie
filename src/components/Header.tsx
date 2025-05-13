
import React from 'react';
import { Link } from 'react-router-dom';
import { Beef } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-4 px-4 sm:px-6 bg-carnivore-card border-b border-carnivore-muted">
      <div className="flex items-center justify-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-carnivore-primary rounded-full p-2">
            <Beef className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-carnivore-foreground tracking-wider text-lg">
              RECIPE
            </span>
            <div className="flex items-center">
              <span className="text-xs tracking-widest text-carnivore-secondary">ON THE GO</span>
              <span className="ml-1 font-bold text-carnivore-primary text-sm">CARNIVORE</span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
