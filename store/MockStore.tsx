import React, { createContext, useContext, useState } from 'react';
import { User, DailyMenu, Order, Message, Comment, Department, UserRole, MenuItem, MasterFoodItem, AppConfig, MenuIssue } from '../types';

interface StoreData {
  currentUser: User | null;
  users: User[];
  menus: DailyMenu[];
  orders: Order[];
  messages: Message[];
  comments: Comment[];
  menuIssues: MenuIssue[];
  departments: Department[];
  appConfig: AppConfig;
  masterFoodItems: MasterFoodItem[];
  
  login: (username: string) => boolean;
  logout: () => void;
  
  addMenu: (menu: DailyMenu) => void;
  updateMenu: (menu: DailyMenu) => void;
  copyMenuFromDate: (sourceDate: string, targetDate: string) => void; // NEW
  
  lockUser: (userId: string, isLocked: boolean) => void;
  addDepartment: (dept: Department) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateAppConfig: (config: AppConfig) => void;
  addMasterItem: (item: MasterFoodItem) => void;
  deleteMasterItem: (id: string) => void;
  placeOrder: (order: Order) => void;
  sendMessage: (msg: Message) => void;
  addComment: (comment: Comment) => void;
  respondToComment: (commentId: string, response: string, responder: User) => void;
  reportIssue: (issue: MenuIssue) => void; 
  respondToIssue: (issueId: string, response: string) => void;
  importData: (data: any) => void;
  exportData: () => any;
}

const StoreContext = createContext<StoreData | undefined>(undefined);

// --- DATA ---
const MOCK_DEPTS: Department[] = [{ id: 'd1', name: 'Engineering' }, { id: 'd2', name: 'Sales' }, { id: 'd3', name: 'HR' }];
const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', fullName: 'Super Admin', role: UserRole.SUPER_ADMIN, email: 'admin@company.com', isLocked: false, avatarUrl: 'https://picsum.photos/200' },
  { id: 'u5', username: 'chef', fullName: 'Head Chef', role: UserRole.KITCHEN_ADMIN, email: 'chef@company.com', isLocked: false, avatarUrl: 'https://picsum.photos/204' },
  { id: 'u3', username: 'emp1', fullName: 'John Doe', role: UserRole.EMPLOYEE, departmentId: 'd1', email: 'john@company.com', isLocked: false, avatarUrl: 'https://picsum.photos/202' },
];

const MOCK_MASTER_ITEMS: MasterFoodItem[] = [
  { id: 'mfi1', name: 'Jerk Chicken', description: 'Spicy marinated', category: 'Protein', calories: 500, dietaryInfo: ['Spicy', 'GF'] },
  { id: 'mfi2', name: 'Curry Goat', description: 'Tender goat meat', category: 'Special', calories: 800, dietaryInfo: ['Spicy'] },
  { id: 'mfi3', name: 'Rice and Peas', description: 'Kidney beans', category: 'Carbohydrate', calories: 300, dietaryInfo: ['Vegan'] },
  { id: 'mfi5', name: 'Fried Rice', description: 'Chinese Style', category: 'Carbohydrate', calories: 400, dietaryInfo: [] },
  { id: 'mfi4', name: 'Steam Vegetable', description: 'Cabbage and Carrots', category: 'Fibre', calories: 50, dietaryInfo: ['Vegan', 'GF'] },
  { id: 'mfi_rv', name: 'Raw Vegetable', description: 'Fresh seasonal vegetables', category: 'Fibre', calories: 30, dietaryInfo: ['Vegan', 'GF', 'Raw'] },
  { id: 'mfi_b1', name: 'White Bread', description: 'Freshly baked', category: 'Sandwiches', calories: 150, dietaryInfo: [] },
];

const MOCK_MENUS: DailyMenu[] = [
  {
    id: 'm1',
    date: new Date().toLocaleDateString('en-CA'),
    notes: "Soup - Med: $480.00, Large: $650.00. Fruit Plate - Small $550, Large $800. NO BOILED FOOD.",
    items: [
      { id: 'i1', name: 'Jerk Chicken', description: 'Spicy marinated', category: 'Protein', calories: 500, dietaryInfo: ['Spicy', 'GF'] },
      { id: 'i5', name: 'Rice and Peas', description: '', category: 'Carbohydrate', calories: 300, dietaryInfo: ['Vegan'] },
      { id: 'i8', name: 'Steam Vegetable', description: '', category: 'Fibre', calories: 50, dietaryInfo: ['Vegan', 'GF'] },
      { id: 'i_rv', name: 'Raw Vegetable', description: '', category: 'Fibre', calories: 30, dietaryInfo: ['Raw', 'Vegan'] },
    ]
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [menus, setMenus] = useState<DailyMenu[]>(MOCK_MENUS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [menuIssues, setMenuIssues] = useState<MenuIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPTS);
  const [masterFoodItems, setMasterFoodItems] = useState<MasterFoodItem[]>(MOCK_MASTER_ITEMS);
  
  // CONFIGURATION STATE
  const [appConfig, setAppConfig] = useState<AppConfig>({
    companyName: 'LunchLink Enterprise',
    tagline: 'Employee Lunch Ordering System',
    logoUrl: '',
    orderCutoffTime: '10:30' // Chef can change this later
  });

  const login = (username: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (user && !user.isLocked) { setCurrentUser(user); return true; }
    return false;
  };
  const logout = () => setCurrentUser(null);
  const addMenu = (menu: DailyMenu) => setMenus(prev => [...prev, menu]);
  const updateMenu = (menu: DailyMenu) => setMenus(prev => prev.map(m => m.id === menu.id ? menu : m));
  
  // NEW COPY FUNCTION
  const copyMenuFromDate = (sourceDate: string, targetDate: string) => {
      const sourceMenu = menus.find(m => m.date === sourceDate);
      if (!sourceMenu) return;
      const newMenu: DailyMenu = {
          ...sourceMenu,
          id: Date.now().toString(),
          date: targetDate
      };
      if (menus.some(m => m.date === targetDate)) {
          setMenus(prev => prev.map(m => m.date === targetDate ? newMenu : m));
      } else {
          setMenus(prev => [...prev, newMenu]);
      }
  };

  const lockUser = (userId: string, isLocked: boolean) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked } : u));
  const addDepartment = (dept: Department) => setDepartments(prev => [...prev, dept]);
  const placeOrder = (order: Order) => setOrders(prev => [...prev, order]);
  const updateOrderStatus = (orderId: string, status: Order['status']) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  const sendMessage = (msg: Message) => setMessages(prev => [...prev, msg]);
  const addComment = (comment: Comment) => setComments(prev => [...prev, comment]);
  const respondToComment = (commentId: string, response: string, responder: User) => { console.log('respond'); };
  const reportIssue = (issue: MenuIssue) => setMenuIssues(prev => [...prev, issue]);
  const respondToIssue = (issueId: string, response: string) => { setMenuIssues(prev => prev.map(i => i.id === issueId ? { ...i, chefResponse: response, status: 'Resolved' } : i)); };
  const updateAppConfig = (config: AppConfig) => setAppConfig(config);
  const addMasterItem = (item: MasterFoodItem) => setMasterFoodItems(prev => [...prev, item]);
  const deleteMasterItem = (id: string) => setMasterFoodItems(prev => prev.filter(i => i.id !== id));
  const importData = (data: any) => { if(data.users) setUsers(prev=>[...prev, ...data.users]); };
  const exportData = () => ({ users, menus, orders });

  return (
    <StoreContext.Provider value={{
      currentUser, users, menus, orders, messages, comments, menuIssues, departments, appConfig, masterFoodItems,
      login, logout, addMenu, updateMenu, copyMenuFromDate, lockUser, addDepartment, updateOrderStatus,
      placeOrder, sendMessage, addComment, respondToComment, reportIssue, respondToIssue,
      updateAppConfig, addMasterItem, deleteMasterItem, importData, exportData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};