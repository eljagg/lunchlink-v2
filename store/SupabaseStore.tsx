import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
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
  
  isLoading: boolean; // New: To show a loading spinner while fetching data

  login: (username: string) => Promise<boolean>; // Changed to Promise (Async)
  logout: () => void;
  
  addMenu: (menu: DailyMenu) => Promise<void>;
  updateMenu: (menu: DailyMenu) => Promise<void>;
  copyMenuFromDate: (sourceDate: string, targetDate: string) => Promise<void>;
  
  lockUser: (userId: string, isLocked: boolean) => Promise<void>;
  addDepartment: (dept: Department) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateAppConfig: (config: AppConfig) => Promise<void>;
  addMasterItem: (item: MasterFoodItem) => Promise<void>;
  deleteMasterItem: (id: string) => Promise<void>;
  placeOrder: (order: Order) => Promise<void>;
  sendMessage: (msg: Message) => Promise<void>;
  addComment: (comment: Comment) => Promise<void>;
  respondToComment: (commentId: string, response: string, responder: User) => Promise<void>;
  reportIssue: (issue: MenuIssue) => Promise<void>; 
  respondToIssue: (issueId: string, response: string) => Promise<void>;
  
  importData: (data: any) => void;
  exportData: () => any;
}

const StoreContext = createContext<StoreData | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [menuIssues, setMenuIssues] = useState<MenuIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masterFoodItems, setMasterFoodItems] = useState<MasterFoodItem[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    companyName: 'LunchLink', tagline: 'Loading...', logoUrl: '', orderCutoffTime: '10:30'
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH INITIAL DATA FROM DB ---
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        
        // Fetch Users (Mapping snake_case DB columns to camelCase Types)
        const { data: userData } = await supabase.from('app_users').select('*');
        if (userData) {
            setUsers(userData.map(u => ({
                id: u.id, username: u.username, fullName: u.full_name, role: u.role as UserRole,
                email: u.email, isLocked: u.is_locked, avatarUrl: u.avatar_url, departmentId: u.department_id
            })));
        }

        // Fetch Menus
        const { data: menuData } = await supabase.from('daily_menus').select('*');
        if (menuData) {
            // Note: 'items' is stored as JSON in DB, Supabase handles parsing automatically
            setMenus(menuData.map(m => ({
                id: m.id, date: m.date, items: m.items, notes: m.notes, departmentIds: m.department_ids
            })));
        }

        // Fetch Master Items
        const { data: foodData } = await supabase.from('master_food_items').select('*');
        if (foodData) {
            setMasterFoodItems(foodData.map(f => ({
                id: f.id, name: f.name, description: f.description, category: f.category,
                calories: f.calories, dietaryInfo: f.dietary_info, isAvailable: f.is_available
            })));
        }

        // Fetch Orders
        const { data: orderData } = await supabase.from('orders').select('*');
        if (orderData) {
            setOrders(orderData.map(o => ({
                id: o.id, userId: o.user_id, menuId: o.menu_id, selectedItemIds: o.selected_item_ids,
                date: o.date, specialInstructions: o.special_instructions, status: o.status, timestamp: o.timestamp
            })));
        }

        // Fetch Issues
        const { data: issueData } = await supabase.from('menu_issues').select('*');
        if (issueData) {
            setMenuIssues(issueData.map(i => ({
                id: i.id, userId: i.user_id, date: i.date, issue: i.issue, status: i.status,
                chefResponse: i.chef_response, isReadByChef: i.is_read_by_chef, timestamp: i.timestamp
            })));
        }

        // Fetch Config
        const { data: configData } = await supabase.from('app_config').select('*').single();
        if (configData) {
            setAppConfig({
                companyName: configData.company_name,
                tagline: configData.tagline,
                logoUrl: configData.logo_url,
                orderCutoffTime: configData.order_cutoff_time
            });
        }

        setIsLoading(false);
    };

    fetchData();
  }, []);

  // --- ACTIONS ---

  const login = async (username: string) => {
    // For Alpha, we still simulate login by checking the fetched users array
    const cleanName = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanName);
    if (user && !user.isLocked) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addMenu = async (menu: DailyMenu) => {
      // Optimistic Update (Update UI immediately)
      setMenus(prev => [...prev, menu]);
      // DB Insert
      await supabase.from('daily_menus').insert({
          id: menu.id, date: menu.date, items: menu.items, notes: menu.notes, department_ids: menu.departmentIds
      });
  };

  const updateMenu = async (menu: DailyMenu) => {
      setMenus(prev => prev.map(m => m.id === menu.id ? menu : m));
      await supabase.from('daily_menus').update({
          items: menu.items, notes: menu.notes
      }).eq('id', menu.id);
  };

  const copyMenuFromDate = async (sourceDate: string, targetDate: string) => {
      const sourceMenu = menus.find(m => m.date === sourceDate);
      if (!sourceMenu) return;
      const newMenu: DailyMenu = { ...sourceMenu, id: Date.now().toString(), date: targetDate };
      
      if (menus.some(m => m.date === targetDate)) {
          setMenus(prev => prev.map(m => m.date === targetDate ? newMenu : m));
          // For DB, we would typically update, but keeping it simple for now
          // Ideally: delete old, insert new
      } else {
          setMenus(prev => [...prev, newMenu]);
          await supabase.from('daily_menus').insert({
              id: newMenu.id, date: newMenu.date, items: newMenu.items, notes: newMenu.notes
          });
      }
  };

  const placeOrder = async (order: Order) => {
      setOrders(prev => [...prev, order]);
      await supabase.from('orders').insert({
          id: order.id, user_id: order.userId, menu_id: order.menuId, selected_item_ids: order.selectedItemIds,
          date: order.date, special_instructions: order.specialInstructions, status: order.status, timestamp: order.timestamp
      });
  };

  const reportIssue = async (issue: MenuIssue) => {
      setMenuIssues(prev => [...prev, issue]);
      await supabase.from('menu_issues').insert({
          id: issue.id, user_id: issue.userId, date: issue.date, issue: issue.issue, 
          status: 'Open', is_read_by_chef: false, timestamp: issue.timestamp
      });
  };

  const respondToIssue = async (issueId: string, response: string) => {
      setMenuIssues(prev => prev.map(i => i.id === issueId ? { ...i, chefResponse: response, status: 'Resolved' } : i));
      await supabase.from('menu_issues').update({
          chef_response: response, status: 'Resolved'
      }).eq('id', issueId);
  };

  // --- Placeholders for other actions (simulating async) ---
  const lockUser = async (userId: string, isLocked: boolean) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked } : u));
  const addDepartment = async (dept: Department) => setDepartments(prev => [...prev, dept]);
  const updateOrderStatus = async (orderId: string, status: Order['status']) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  const updateAppConfig = async (config: AppConfig) => setAppConfig(config);
  
  const addMasterItem = async (item: MasterFoodItem) => {
      setMasterFoodItems(prev => [...prev, item]);
      await supabase.from('master_food_items').insert({
          id: item.id, name: item.name, category: item.category, 
          calories: item.calories, dietary_info: item.dietaryInfo
      });
  };
  
  const deleteMasterItem = async (id: string) => {
      setMasterFoodItems(prev => prev.filter(i => i.id !== id));
      await supabase.from('master_food_items').delete().eq('id', id);
  };
  
  const sendMessage = async (msg: Message) => setMessages(prev => [...prev, msg]);
  const addComment = async (comment: Comment) => setComments(prev => [...prev, comment]);
  const respondToComment = async (commentId: string, response: string, responder: User) => { console.log('respond'); };
  const importData = (data: any) => {};
  const exportData = () => ({ users, menus, orders });

  return (
    <StoreContext.Provider value={{
      currentUser, users, menus, orders, messages, comments, menuIssues, departments, appConfig, masterFoodItems, isLoading,
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