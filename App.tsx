import React, { useState, useEffect } from 'react';
// FIXED IMPORT: Using SupabaseStore
import { StoreProvider, useStore } from './store/SupabaseStore';
import Login from './views/Login';
import Layout from './components/Layout';
import { OrderLunchView, OrderHistoryView, MessagesView, FeedbackView } from './views/EmployeeViews'; 
// FIXED IMPORT: Added AdminCompanyManager to the list
import { AdminKitchenDashboard, AdminMenuManager, KitchenMasterDatabase, AdminUserManager, AdminDepts, AdminCompanyManager } from './views/AdminViews';
import { UserRole } from '../types';

const DashboardStats: React.FC = () => {
    return <div className="p-4 bg-white rounded shadow">Dashboard Stats Placeholder</div>;
};

const HRPlaceholder: React.FC = () => <div className="p-8">HR Views coming soon...</div>;

const MainContent: React.FC = () => {
  const { currentUser } = useStore();
  
  const [activeView, setActiveView] = useState(() => 
    currentUser?.role === UserRole.EMPLOYEE ? 'order' : 'dashboard'
  );

  useEffect(() => {
    if (currentUser) {
        // Default views based on Role
        if (currentUser.role === UserRole.EMPLOYEE) setActiveView('order');
        else if (currentUser.role === UserRole.KITCHEN_ADMIN) setActiveView('admin-kitchen');
        else setActiveView('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) return <Login />;

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardStats />;
      
      // Employee Views
      case 'order': return <OrderLunchView />;
      case 'history': return <OrderHistoryView />;
      case 'messages': return <MessagesView />;
      case 'comments': return <FeedbackView />;
      
      // Kitchen Admin Views
      case 'admin-kitchen': return <AdminKitchenDashboard />;
      case 'admin-menus': return <AdminMenuManager />;
      case 'admin-food-db': return <KitchenMasterDatabase />;
      
      // Super Admin Views
      case 'admin-users': return <AdminUserManager />;
      case 'admin-depts': return <AdminDepts />;
      case 'admin-companies': return <AdminCompanyManager />; // <--- NEW SCREEN
      
      // HR Views
      case 'hr-comments': return <HRPlaceholder />;
      
      default: return <DashboardStats />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;
