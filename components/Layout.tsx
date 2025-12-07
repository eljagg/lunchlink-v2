import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { UserRole } from '../types';
import { 
  LayoutDashboard, Utensils, History, MessageSquare, Users, 
  Building, LogOut, FileText, ChefHat, Database, Menu, X, Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const { currentUser, currentCompany, logout, appConfig } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return <>{children}</>;

  // Use Company Colors or Default Fallback
  const primaryColor = currentCompany?.primaryColor || '#2563eb'; // Default Blue
  const companyName = currentCompany?.name || appConfig?.companyName || 'LunchLink';

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false); 
  };

  // Header Title Logic
  const getHeaderTitle = () => {
      if (activeView === 'admin-menus') {
          const name = currentUser.fullName.split(' ')[0]; 
          return `${name}'s Menus`;
      }
      if (activeView === 'order') return 'Lunch Menu';
      if (activeView === 'admin-companies') return 'Company Management';
      return activeView.replace('-', ' ');
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => handleNavigate(view)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 
          ${isActive ? 'text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`
        }
        style={isActive ? { backgroundColor: primaryColor } : {}}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200"> 
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 shadow-md z-30 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
             <div className="p-2 rounded-lg" style={{ backgroundColor: primaryColor }}><Utensils className="w-6 h-6 text-white" /></div>
             <span className="font-bold text-white text-lg truncate">{companyName}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && ( <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} /> )}

      {/* SIDEBAR */}
      <aside className={`
          fixed md:relative z-40 h-full w-64 bg-slate-950 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:flex
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="flex items-center space-x-3">
             <div className="p-2 rounded-lg" style={{ backgroundColor: primaryColor }}><Utensils className="w-6 h-6 text-white" /></div>
             <div>
                <span className="text-sm font-bold text-white block leading-tight">{companyName}</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 mt-20 md:mt-0">
          <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          
          {currentUser.role === UserRole.EMPLOYEE && (
            <>
              <NavItem view="order" icon={Utensils} label="Lunch Menu" />
              <NavItem view="history" icon={History} label="Order History" />
              <NavItem view="messages" icon={MessageSquare} label="Messages" />
              <NavItem view="comments" icon={FileText} label="Feedback" />
            </>
          )}

          {(currentUser.role === UserRole.KITCHEN_ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
            <>
              <div className="mt-6 px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Kitchen Admin</div>
              <NavItem view="admin-kitchen" icon={ChefHat} label="Kitchen Dashboard" />
              <NavItem view="admin-menus" icon={Utensils} label="Manage Menus" />
              <NavItem view="admin-food-db" icon={Database} label="Food Database" />
              <NavItem view="messages" icon={MessageSquare} label="Message Box" />
            </>
          )}

          {/* SUPER ADMIN ONLY */}
          {currentUser.role === UserRole.SUPER_ADMIN && (
            <>
              <div className="mt-6 px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Super Admin</div>
              <NavItem view="admin-companies" icon={Building} label="Companies" /> {/* <--- NEW LINK */}
              <NavItem view="admin-users" icon={Users} label="Manage Users" />
              <NavItem view="admin-depts" icon={Settings} label="Departments" />
              <NavItem view="admin-config" icon={FileText} label="App Config" />
            </>
          )}

          {currentUser.role === UserRole.HR && (
             <NavItem view="hr-comments" icon={MessageSquare} label="Employee Comments" />
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center mb-4">
             <img src={currentUser.avatarUrl || 'https://via.placeholder.com/40'} alt="User" className="w-10 h-10 rounded-full mr-3 border-2 border-slate-700" />
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-white truncate">{currentUser.fullName}</p>
               <p className="text-xs text-slate-400 capitalize truncate">{currentUser.role.replace('_', ' ').toLowerCase()}</p>
             </div>
          </div>
          <button onClick={logout} className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-400 bg-slate-800 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors border border-slate-700">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-full w-full pt-20 md:pt-0 bg-slate-950">
        <header className="bg-slate-900 shadow-sm sticky top-0 z-20 px-4 md:px-8 py-4 flex justify-between items-center hidden md:flex border-b border-slate-800">
            <h1 className="text-2xl font-bold text-white capitalize">
                {getHeaderTitle()}
            </h1>
            <span className="text-sm text-slate-400 font-medium" style={{ color: primaryColor }}>
                {currentCompany?.welcomeMessage}
            </span>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
