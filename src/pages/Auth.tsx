
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, Mail, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

type AuthMode = 'sign-in' | 'sign-up';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [loading, setLoading] = useState(false);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        if (error) throw error;
        
        toast.success('Sign up successful! Please check your email.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
  };
  
  return (
    <div className="leather-bg min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-carnivore-primary rounded-full p-3 mb-4">
          <Beef className="h-10 w-10 text-white" />
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-carnivore-foreground tracking-wider text-xl">
            RECIPE
          </span>
          <div className="flex items-center">
            <span className="text-xs tracking-widest text-carnivore-secondary">ON THE GO</span>
            <span className="ml-1 font-bold text-carnivore-primary text-sm">CARNIVORE</span>
          </div>
        </div>
      </div>
      
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-8">
          {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-carnivore-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carnivore-secondary" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-carnivore-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carnivore-secondary" size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pl-10 w-full"
                minLength={6}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={toggleMode}
            className="text-carnivore-primary hover:underline text-sm"
          >
            {mode === 'sign-in' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
