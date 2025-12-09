import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/SupabaseStore';
import Login from './views/Login';
import Layout from './components/Layout';
import { OrderLunchView, OrderHistoryView, MessagesView, FeedbackView } from './views/EmployeeViews'; 
import { AdminKitchenDashboard, AdminMenuManager, KitchenMasterDatabase, AdminUserManager, AdminDepts, AdminCompanyManager, AdminAppConfig } from './views/AdminViews';
import { GuestPortal } from './views/GuestViews';
// NEW IMPORTS
import { ReceptionDashboard } from './views/ReceptionViews';
import { DeliveryDashboard } from './views/DeliveryViews';
import { UserRole } from './types';

const DashboardStats: React.FC = () => {
    return <div className="p-8 text-white">Select an option from the menu.</div>;
};

const HRPlaceholder: React.FC = () => <div className="p-8 text-white">HR Views coming soon...</div>;

const MainContent: React.FC = () => {
  const { currentUser } = useStore();
  
  const [activeView, setActiveView] = useState('dashboard');

  // Set default view based on Role
  useEffect(() => {
    if (currentUser) {
        if (currentUser.role === UserRole.EMPLOYEE) setActiveView('order');
        else if (currentUser.role === UserRole.KITCHEN_ADMIN) setActiveView('admin-kitchen');
        else if (currentUser.role === UserRole.RECEPTIONIST) setActiveView('reception-dashboard'); // New Default
        else if (currentUser.role === UserRole.DELIVERY) setActiveView('delivery-dashboard'); // New Default
        else if (currentUser.role === UserRole.GUEST) setActiveView('guest-portal');
        else setActiveView('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) return <Login />;

  // Special Case: Guest Portal has its own layout (Full Screen)
  if (activeView === 'guest-portal') {
      return <GuestPortal />;
  }

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardStats />;
      // Employee
      case 'order': return <OrderLunchView />;
      case 'history': return <OrderHistoryView />;
      case 'messages': return <MessagesView />;
      case 'comments': return <FeedbackView />;
      
      // Kitchen Admin
      case 'admin-kitchen': return <AdminKitchenDashboard />;
      case 'admin-menus': return <AdminMenuManager />;
      case 'admin-food-db': return <KitchenMasterDatabase />;
      
      // Super Admin
      case 'admin-users': return <AdminUserManager />;
      case 'admin-depts': return <AdminDepts />;
      case 'admin-companies': return <AdminCompanyManager />;
      case 'admin-config': return <AdminAppConfig />;
      
      // Logistics (NEW)
      case 'reception-dashboard': return <ReceptionDashboard />;
      case 'delivery-dashboard': return <DeliveryDashboard />;

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
