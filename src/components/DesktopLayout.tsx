
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Menu } from 'lucide-react';

interface DesktopLayoutProps {
  children: React.ReactNode;
  session: any | null;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, session }) => {
  const navigate = useNavigate();

  return (
    <div className="leather-bg min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 flex-col bg-carnivore-card border-r border-carnivore-muted h-screen fixed">
        <div className="p-4 border-b border-carnivore-muted">
          <h1 className="text-2xl font-bold text-carnivore-primary">Carnivore Kitchen</h1>
          <p className="text-sm text-carnivore-secondary">Recipe Generator</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-carnivore-muted text-carnivore-foreground hover:text-carnivore-primary transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button 
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-carnivore-muted text-carnivore-foreground hover:text-carnivore-primary transition-colors"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/create-recipe')}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-carnivore-muted text-carnivore-foreground hover:text-carnivore-primary transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Recipe</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate(session ? '/profile' : '/auth')}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-carnivore-muted text-carnivore-foreground hover:text-carnivore-primary transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span>{session ? 'Profile' : 'Login'}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-carnivore-muted">
          <div className="text-xs text-center text-carnivore-secondary">
            <p>Carnivore Kitchen Genie</p>
            <p>© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Main Content with adjusted left margin for desktop */}
      <div className="flex-1 md:ml-64 w-full">
        {children}
      </div>
    </div>
  );
};

export default DesktopLayout;
