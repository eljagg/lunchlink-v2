import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/SupabaseStore';
import Login from './views/Login';
import Layout from './components/Layout';
import { OrderLunchView, OrderHistoryView, MessagesView, FeedbackView } from './views/EmployeeViews'; 
// FIXED IMPORT: Now importing the REAL Admin Views
import { AdminKitchenDashboard, AdminMenuManager, KitchenMasterDatabase, AdminUserManager, AdminDepts } from './views/AdminViews';
import { UserRole } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
        // Employees go to order, Kitchen Admin goes to their dashboard
        if (currentUser.role === UserRole.EMPLOYEE) setActiveView('order');
        else if (currentUser.role === UserRole.KITCHEN_ADMIN) setActiveView('admin-kitchen');
        else setActiveView('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) return <Login />;

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardStats />;
      // Employee
      case 'order': return <OrderLunchView />;
      case 'history': return <OrderHistoryView />;
      case 'messages': return <MessagesView />;
      case 'comments': return <FeedbackView />;
      
      // Kitchen Admin (REAL COMPONENTS NOW)
      case 'admin-kitchen': return <AdminKitchenDashboard />;
      case 'admin-menus': return <AdminMenuManager />;
      case 'admin-food-db': return <KitchenMasterDatabase />;
      
      // Super Admin
      case 'admin-users': return <AdminUserManager />;
      case 'admin-depts': return <AdminDepts />;
      
      // HR
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