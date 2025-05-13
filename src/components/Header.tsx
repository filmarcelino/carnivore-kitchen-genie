
import React from 'react';
import { Link } from 'react-router-dom';
import { Beef } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-4 px-4 sm:px-6 bg-carnivore-card border-b border-carnivore-muted">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <div className="bg-carnivore-primary rounded-full p-2">
            <Beef className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col ml-2">
            <div className="text-xs tracking-widest text-carnivore-secondary">
              RECIPE ON THE GO
            </div>
            <span className="font-bold text-carnivore-primary tracking-wider text-xl w-full">
              CARNIVORE
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
