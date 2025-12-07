import React, { useState } from 'react';
// FIXED IMPORT: Now pointing to SupabaseStore
import { useStore } from '../store/SupabaseStore';
import { Utensils, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { login, appConfig, isLoading } = useStore();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Login is now Async (Database call), so we await it
    const success = await login(username);
    if (!success) {
      setError('Invalid username or account locked');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="inline-flex p-3 bg-white/20 rounded-xl mb-4">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{appConfig?.companyName || 'LunchLink'}</h1>
          <p className="text-blue-100 mt-2">{appConfig?.tagline || 'Login'}</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter username (e.g., emp1)"
                disabled={isLoading}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
              <span className="mr-2">●</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Connecting...' : 'Sign In'}
          </button>
          
          <div className="text-center">
             <p className="text-xs text-gray-400 mt-4">Try: emp1, chef, admin</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;