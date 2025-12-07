import React, { useState } from 'react';
// FIXED IMPORT: Now pointing to SupabaseStore
import { useStore } from '../store/SupabaseStore';
import { Utensils, Lock, ArrowRight } from 'lucide-react';

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
    // THEME UPDATE: 
    // changed 'bg-slate-50' (Light) to 'bg-slate-900' (Dark Navy)
    // Added 'relative' and 'overflow-hidden' for the background shapes
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND DECORATION (Subtle circles to break up the dark space) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* LOGIN CARD */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-700/50">
        
        {/* HEADER SECTION */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-10 text-center">
          <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
            <Utensils className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{appConfig?.companyName || 'LunchLink'}</h1>
          <p className="text-blue-200 mt-2 font-medium">{appConfig?.tagline || 'Employee Portal'}</p>
        </div>
        
        {/* FORM SECTION */}
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username / ID</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // INPUT STYLE: Light gray background to reduce contrast inside the white card
                className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium placeholder-gray-400"
                placeholder="Enter your username"
                disabled={isLoading}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute right-4 top-4" />
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-center border border-red-100">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
                'Connecting...'
            ) : (
                <>
                    Sign In Securely
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
          
          {/* HELPER TEXT */}
          <div className="text-center pt-4 border-t border-gray-100">
             <p className="text-xs text-gray-400">Authorized Access Only</p>
             <p className="text-xs text-gray-300 mt-1">Demo Users: emp1, chef, admin</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
