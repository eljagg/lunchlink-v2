import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, DailyMenu, Order, Message, Comment, Department, UserRole, MenuItem, MasterFoodItem, AppConfig, MenuIssue, MenuTemplate, Company } from '../types';

interface StoreData {
  currentUser: User | null;
  currentCompany: Company | null; // <--- NEW: Holds active company branding
  users: User[]; menus: DailyMenu[]; orders: Order[]; messages: Message[]; comments: Comment[];
  menuIssues: MenuIssue[]; departments: Department[]; appConfig: AppConfig; masterFoodItems: MasterFoodItem[];
  menuTemplates: MenuTemplate[];
  isLoading: boolean;

  login: (usernameOrEmail: string) => Promise<boolean>; 
  logout: () => void;
  
  addMenu: (menu: DailyMenu) => Promise<void>; 
  updateMenu: (menu: DailyMenu) => Promise<void>; 
  copyMenuFromDate: (source: string, target: string) => Promise<void>;
  saveTemplate: (name: string, date: string, isShared: boolean) => Promise<void>;
  loadTemplate: (templateId: string, targetDate: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;

  addMasterItem: (item: MasterFoodItem) => Promise<void>;
  updateMasterItem: (item: MasterFoodItem) => Promise<void>;
  deleteMasterItem: (id: string) => Promise<void>;

  lockUser: (id: string, lock: boolean) => Promise<void>; 
  addDepartment: (d: Department) => Promise<void>; 
  updateOrderStatus: (id: string, s: Order['status']) => Promise<void>;
  updateAppConfig: (c: AppConfig) => Promise<void>; 
  placeOrder: (o: Order) => Promise<void>; 
  sendMessage: (m: Message) => Promise<void>; 
  addComment: (c: Comment) => Promise<void>; 
  respondToComment: (id: string, r: string, u: User) => Promise<void>;
  reportIssue: (i: MenuIssue) => Promise<void>; 
  respondToIssue: (id: string, r: string) => Promise<void>;
  
  importData: (data: any) => void; exportData: () => any;
}

const StoreContext = createContext<StoreData | undefined>(undefined);

// Initial Fallback Data
const DEFAULT_COMPANY: Company = {
    id: 'default',
    name: 'LunchLink Enterprise',
    logoUrl: '',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    welcomeMessage: 'Welcome to the Employee Portal'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null); // New State
  
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [menuIssues, setMenuIssues] = useState<MenuIssue[]>([]);
  const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masterFoodItems, setMasterFoodItems] = useState<MasterFoodItem[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ companyName: 'LunchLink', tagline: 'Loading...', logoUrl: '', orderCutoffTime: '10:30' });
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIN LOGIC (The "Chameleon" Brain) ---
  const login = async (input: string) => {
    setIsLoading(true);
    try {
        const cleanInput = input.trim().toLowerCase();
        
        // 1. Find User by Username OR Email
        const { data: userMatches, error } = await supabase
            .from('app_users')
            .select('*')
            .or(`username.eq.${cleanInput},email.eq.${cleanInput}`)
            .single();

        if (error || !userMatches) {
            setIsLoading(false);
            return false;
        }

        const user: User = {
            id: userMatches.id, username: userMatches.username, fullName: userMatches.full_name,
            role: userMatches.role as UserRole, email: userMatches.email, isLocked: userMatches.is_locked,
            avatarUrl: userMatches.avatar_url, departmentId: userMatches.department_id,
            companyId: userMatches.company_id // Grab the company ID
        };

        if (user.isLocked) { setIsLoading(false); return false; }

        // 2. Fetch Company Details (Colors, Logo)
        if (user.companyId) {
            const { data: compData } = await supabase.from('companies').select('*').eq('id', user.companyId).single();
            if (compData) {
                setCurrentCompany({
                    id: compData.id, name: compData.name, logoUrl: compData.logo_url,
                    primaryColor: compData.primary_color, secondaryColor: compData.secondary_color,
                    welcomeMessage: compData.welcome_message
                });
            }
        } else {
            setCurrentCompany(DEFAULT_COMPANY);
        }

        setCurrentUser(user);
        await fetchCompanyData(user.companyId || '');
        setIsLoading(false);
        return true;
    } catch (e) {
        console.error("Login Error", e);
        setIsLoading(false);
        return false;
    }
  };

  const logout = () => {
      setCurrentUser(null);
      setCurrentCompany(null);
      setMenus([]); // Clear sensitive data
      setOrders([]);
  };

  // --- DATA FETCHING (Filtered by Company) ---
  const fetchCompanyData = async (companyId: string) => {
      if (!companyId) return;

      // Fetch Menus for THIS company
      const { data: mData } = await supabase.from('daily_menus').select('*').eq('company_id', companyId);
      if(mData) setMenus(mData.map(m => ({ id: m.id, date: m.date, items: m.items, notes: m.notes, departmentIds: m.department_ids })));

      // Fetch Master Items for THIS company
      const { data: fData } = await supabase.from('master_food_items').select('*').eq('company_id', companyId);
      if(fData) setMasterFoodItems(fData.map(f => ({ id: f.id, name: f.name, description: f.description, category: f.category, calories: f.calories, dietaryInfo: f.dietary_info, isAvailable: f.is_available })));

      // Fetch Orders for THIS company
      const { data: oData } = await supabase.from('orders').select('*').eq('company_id', companyId);
      if(oData) setOrders(oData.map(o => ({ id: o.id, userId: o.user_id, menuId: o.menu_id, selectedItemIds: o.selected_item_ids, date: o.date, specialInstructions: o.special_instructions, status: o.status, timestamp: o.timestamp })));
      
      // Fetch Issues
      const { data: iData } = await supabase.from('menu_issues').select('*').eq('company_id', companyId);
      if(iData) setMenuIssues(iData.map(i => ({ id: i.id, userId: i.user_id, date: i.date, issue: i.issue, status: i.status, chefResponse: i.chef_response, isReadByChef: i.is_read_by_chef, timestamp: i.timestamp })));
      
      // Fetch Templates
      const { data: tData } = await supabase.from('menu_templates').select('*').eq('company_id', companyId).order('created_at', { ascending: false }); 
      if (tData) setMenuTemplates(tData.map(t => ({ id: t.id, name: t.name, items: t.items, notes: t.notes, createdById: t.created_by_id, createdByName: t.created_by_name, isShared: t.is_shared, createdAt: t.created_at })));
  };

  // --- ACTIONS (Tagging data with Company ID) ---
  const addMenu = async (menu: DailyMenu) => { 
      setMenus(p => [...p, menu]); 
      await supabase.from('daily_menus').insert({ id: menu.id, date: menu.date, items: menu.items, notes: menu.notes, department_ids: menu.departmentIds, company_id: currentUser?.companyId }); 
  };
  
  const updateMenu = async (menu: DailyMenu) => { 
      setMenus(p => p.map(m => m.id === menu.id ? menu : m)); 
      await supabase.from('daily_menus').update({ items: menu.items, notes: menu.notes }).eq('id', menu.id); 
  };
  
  const copyMenuFromDate = async (source: string, target: string) => {
      const src = menus.find(m => m.date === source); if(!src) return;
      const newM: DailyMenu = { ...src, id: Date.now().toString(), date: target };
      if(menus.some(m => m.date === target)) { setMenus(p => p.map(m => m.date === target ? newM : m)); await supabase.from('daily_menus').update({ items: newM.items, notes: newM.notes }).eq('date', target); }
      else { setMenus(p => [...p, newM]); await supabase.from('daily_menus').insert({ id: newM.id, date: newM.date, items: newM.items, notes: newM.notes, company_id: currentUser?.companyId }); }
  };

  const saveTemplate = async (name: string, date: string, isShared: boolean) => {
      if (!currentUser) return;
      const menu = menus.find(m => m.date === date); if (!menu) return;
      const newTpl: MenuTemplate = { id: 'tpl_' + Date.now(), name, items: menu.items, notes: menu.notes, createdById: currentUser.id, createdByName: currentUser.fullName, isShared, createdAt: new Date().toISOString() };
      setMenuTemplates(p => [newTpl, ...p]);
      await supabase.from('menu_templates').insert({ id: newTpl.id, name: newTpl.name, items: newTpl.items, notes: newTpl.notes, created_by_id: newTpl.createdById, created_by_name: newTpl.createdByName, is_shared: newTpl.isShared, created_at: newTpl.createdAt, company_id: currentUser.companyId });
  };

  const loadTemplate = async (templateId: string, targetDate: string) => {
      const tpl = menuTemplates.find(t => t.id === templateId); if (!tpl) return;
      const newMenu: DailyMenu = { id: Date.now().toString(), date: targetDate, items: tpl.items, notes: tpl.notes };
      if (menus.some(m => m.date === targetDate)) { setMenus(p => p.map(m => m.date === targetDate ? newMenu : m)); await supabase.from('daily_menus').update({ items: newMenu.items, notes: newMenu.notes }).eq('date', targetDate); }
      else { setMenus(p => [...p, newMenu]); await supabase.from('daily_menus').insert({ id: newMenu.id, date: newMenu.date, items: newMenu.items, notes: newMenu.notes, company_id: currentUser?.companyId }); }
  };

  const addMasterItem = async (i: MasterFoodItem) => { 
      setMasterFoodItems(p => [...p, i]); 
      await supabase.from('master_food_items').insert({ id: i.id, name: i.name, category: i.category, calories: i.calories, dietary_info: i.dietaryInfo, company_id: currentUser?.companyId }); 
  };
  
  const updateMasterItem = async (i: MasterFoodItem) => {
      setMasterFoodItems(prev => prev.map(item => item.id === i.id ? i : item));
      await supabase.from('master_food_items').update({ name: i.name, category: i.category, calories: i.calories, description: i.description, dietary_info: i.dietaryInfo }).eq('id', i.id);
  };
  
  const deleteMasterItem = async (id: string) => { setMasterFoodItems(p => p.filter(i => i.id !== id)); await supabase.from('master_food_items').delete().eq('id', id); };
  const deleteTemplate = async (id: string) => { setMenuTemplates(p => p.filter(t => t.id !== id)); await supabase.from('menu_templates').delete().eq('id', id); };
  const placeOrder = async (o: Order) => { setOrders(p => [...p, o]); await supabase.from('orders').insert({ id: o.id, user_id: o.userId, menu_id: o.menuId, selected_item_ids: o.selectedItemIds, date: o.date, special_instructions: o.specialInstructions, status: o.status, timestamp: o.timestamp, company_id: currentUser?.companyId }); };
  const reportIssue = async (i: MenuIssue) => { setMenuIssues(p => [...p, i]); await supabase.from('menu_issues').insert({ id: i.id, user_id: i.userId, date: i.date, issue: i.issue, status: 'Open', is_read_by_chef: false, timestamp: i.timestamp, company_id: currentUser?.companyId }); };

  // ... (Other functions remain similar but should implicitly trust the RLS policies in future)
  const lockUser = async (id: string, l: boolean) => setUsers(p => p.map(u => u.id === id ? { ...u, isLocked: l } : u));
  const addDepartment = async (d: Department) => setDepartments(p => [...p, d]);
  const updateOrderStatus = async (id: string, s: Order['status']) => setOrders(p => p.map(o => o.id === id ? { ...o, status: s } : o));
  const updateAppConfig = async (c: AppConfig) => setAppConfig(c);
  const sendMessage = async (m: Message) => setMessages(p => [...p, m]);
  const addComment = async (c: Comment) => setComments(p => [...p, c]);
  const respondToComment = async (id: string, r: string, u: User) => {};
  const respondToIssue = async (id: string, r: string) => { setMenuIssues(p => p.map(i => i.id === id ? { ...i, chefResponse: r, status: 'Resolved' } : i)); await supabase.from('menu_issues').update({ chef_response: r, status: 'Resolved' }).eq('id', id); };
  const importData = (d: any) => {}; const exportData = () => ({ users, menus, orders });

  return (
    <StoreContext.Provider value={{
      currentUser, currentCompany, users, menus, orders, messages, comments, menuIssues, departments, appConfig, masterFoodItems, menuTemplates, isLoading,
      login, logout, addMenu, updateMenu, copyMenuFromDate, saveTemplate, loadTemplate, deleteTemplate,
      lockUser, addDepartment, updateOrderStatus, placeOrder, sendMessage, addComment, respondToComment, reportIssue, respondToIssue,
      updateAppConfig, addMasterItem, updateMasterItem, deleteMasterItem, importData, exportData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore must be used within StoreProvider"); return context; };
