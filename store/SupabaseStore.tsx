import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, DailyMenu, Order, Message, Comment, Department, UserRole, MenuItem, MasterFoodItem, AppConfig, MenuIssue, MenuTemplate, Company } from '../types';

interface StoreData {
  currentUser: User | null; currentCompany: Company | null; users: User[]; menus: DailyMenu[]; orders: Order[]; messages: Message[]; comments: Comment[];
  menuIssues: MenuIssue[]; departments: Department[]; appConfig: AppConfig; masterFoodItems: MasterFoodItem[]; menuTemplates: MenuTemplate[];
  companies: Company[]; isLoading: boolean;

  login: (input: string) => Promise<boolean>; logout: () => void;
  loginAsGuest: (companyId: string) => void; placeGuestOrder: (order: Order) => Promise<void>;

  addMenu: (menu: DailyMenu) => Promise<void>; updateMenu: (menu: DailyMenu) => Promise<void>; copyMenuFromDate: (source: string, target: string) => Promise<void>;
  saveTemplate: (name: string, date: string, isShared: boolean) => Promise<void>; loadTemplate: (templateId: string, targetDate: string) => Promise<void>; deleteTemplate: (templateId: string) => Promise<void>;
  addMasterItem: (item: MasterFoodItem) => Promise<void>; updateMasterItem: (item: MasterFoodItem) => Promise<void>; deleteMasterItem: (id: string) => Promise<void>;
  
  // USER MANAGEMENT
  addUser: (u: User) => Promise<void>; 
  updateUser: (u: User) => Promise<void>; 
  importUsers: (users: User[]) => Promise<void>; // <--- NEW BULK IMPORT
  lockUser: (id: string, lock: boolean) => Promise<void>;
  
  // DEPT MANAGEMENT
  addDepartment: (d: Department) => Promise<void>; 
  updateDepartment: (d: Department) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  updateOrderStatus: (id: string, s: Order['status']) => Promise<void>;
  markBatchDelivered: (orderIds: string[]) => Promise<void>; 

  updateAppConfig: (c: AppConfig) => Promise<void>; 
  generateNewGuestCode: () => Promise<string>;

  placeOrder: (o: Order) => Promise<void>; sendMessage: (m: Message) => Promise<void>; addComment: (c: Comment) => Promise<void>; 
  respondToComment: (id: string, r: string, u: User) => Promise<void>;
  reportIssue: (i: MenuIssue) => Promise<void>; respondToIssue: (id: string, r: string) => Promise<void>;
  addCompany: (c: Company) => Promise<void>; updateCompany: (c: Company) => Promise<void>; deleteCompany: (id: string) => Promise<void>;
  importData: (data: any) => void; exportData: () => any;
}

const StoreContext = createContext<StoreData | undefined>(undefined);
const DEFAULT_COMPANY: Company = { id: 'default', name: 'LunchLink Enterprise', logoUrl: '', primaryColor: '#2563eb', secondaryColor: '#1e40af', welcomeMessage: 'Employee Portal', tagline: '' };

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [menuIssues, setMenuIssues] = useState<MenuIssue[]>([]);
  const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [masterFoodItems, setMasterFoodItems] = useState<MasterFoodItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ companyName: 'LunchLink', tagline: 'Loading...', logoUrl: '', orderCutoffTime: '10:30', guestMode: 'PASSCODE', guestPasscode: 'LUNCH2025', guestQrToken: 'secret' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const { data: uData } = await supabase.from('app_users').select('*'); if(uData) setUsers(uData.map(u => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role as UserRole, email: u.email, isLocked: u.is_locked, avatarUrl: u.avatar_url, departmentId: u.department_id, companyId: u.company_id })));
        const { data: mData } = await supabase.from('daily_menus').select('*'); if(mData) setMenus(mData.map(m => ({ id: m.id, date: m.date, items: m.items, notes: m.notes, departmentIds: m.department_ids, companyId: m.company_id })));
        const { data: fData } = await supabase.from('master_food_items').select('*'); if(fData) setMasterFoodItems(fData.map(f => ({ id: f.id, name: f.name, description: f.description, category: f.category, calories: f.calories, dietaryInfo: f.dietary_info, isAvailable: f.is_available, companyId: f.company_id })));
        const { data: oData } = await supabase.from('orders').select('*'); if(oData) setOrders(oData.map(o => ({ id: o.id, userId: o.user_id, menuId: o.menu_id, selectedItemIds: o.selected_item_ids, date: o.date, specialInstructions: o.special_instructions, status: o.status, timestamp: o.timestamp, companyId: o.company_id, guestName: o.guest_name, guestHostEmail: o.guest_host_email })));
        const { data: iData } = await supabase.from('menu_issues').select('*'); if(iData) setMenuIssues(iData.map(i => ({ id: i.id, userId: i.user_id, date: i.date, issue: i.issue, status: i.status, chefResponse: i.chef_response, isReadByChef: i.is_read_by_chef, timestamp: i.timestamp, companyId: i.company_id })));
        const { data: cmData } = await supabase.from('comments').select('*'); if(cmData) setComments(cmData.map(c => ({ id: c.id, userId: c.user_id, userName: c.user_name, content: c.content, timestamp: c.timestamp, responses: c.responses || [] })));
        const { data: tData } = await supabase.from('menu_templates').select('*').order('created_at', { ascending: false }); if (tData) setMenuTemplates(tData.map(t => ({ id: t.id, name: t.name, items: t.items, notes: t.notes, createdById: t.created_by_id, createdByName: t.created_by_name, isShared: t.is_shared, created_at: t.created_at, companyId: t.company_id })));
        const { data: cpData } = await supabase.from('companies').select('*'); if (cpData) setCompanies(cpData.map(c => ({ id: c.id, name: c.name, logoUrl: c.logo_url, primaryColor: c.primary_color, secondaryColor: c.secondary_color, welcomeMessage: c.welcome_message, tagline: c.tagline })));
        const { data: depData } = await supabase.from('departments').select('*'); if(depData) setDepartments(depData.map(d => ({ id: d.id, name: d.name })));
        const { data: cData } = await supabase.from('app_config').select('*').single(); if(cData) setAppConfig({ companyName: cData.company_name, tagline: cData.tagline, logoUrl: cData.logo_url, orderCutoffTime: cData.order_cutoff_time, guestMode: cData.guest_mode, guestPasscode: cData.guest_passcode, guestQrToken: cData.guest_qr_token });
        setIsLoading(false);
    };
    fetchData();
  }, []);

  const login = async (input: string) => {
    setIsLoading(true);
    try {
        const cleanInput = input.trim().toLowerCase();
        const { data: userMatches, error } = await supabase.from('app_users').select('*').or(`username.eq.${cleanInput},email.eq.${cleanInput}`).maybeSingle();
        if (error || !userMatches) { setIsLoading(false); return false; }

        const user: User = { id: userMatches.id, username: userMatches.username, fullName: userMatches.full_name, role: userMatches.role as UserRole, email: userMatches.email, isLocked: userMatches.is_locked, avatarUrl: userMatches.avatar_url, departmentId: userMatches.department_id, companyId: userMatches.company_id };
        if (user.isLocked) { setIsLoading(false); return false; }

        if (user.companyId) {
            const { data: compData } = await supabase.from('companies').select('*').eq('id', user.companyId).single();
            if (compData) setCurrentCompany({ id: compData.id, name: compData.name, logoUrl: compData.logo_url, primaryColor: compData.primary_color, secondaryColor: compData.secondary_color, welcomeMessage: compData.welcome_message, tagline: compData.tagline });
        } else { setCurrentCompany(DEFAULT_COMPANY); }
        setCurrentUser(user); setIsLoading(false); return true;
    } catch (e) { console.error(e); setIsLoading(false); return false; }
  };
  
  const logout = () => { setCurrentUser(null); setCurrentCompany(null); setMenus([]); setOrders([]); };
  const loginAsGuest = (companyId: string) => { const comp = companies.find(c => c.id === companyId); if (comp) setCurrentCompany(comp); setCurrentUser({ id: 'guest_' + Date.now(), username: 'guest', fullName: 'Guest User', email: '', role: UserRole.GUEST, isLocked: false, companyId: companyId }); };
  const placeGuestOrder = async (order: Order) => { setOrders(prev => [...prev, order]); await supabase.from('orders').insert({ id: order.id, menu_id: order.menuId, selected_item_ids: order.selectedItemIds, date: order.date, special_instructions: order.specialInstructions, status: order.status, timestamp: order.timestamp, company_id: order.companyId, guest_name: order.guestName, guest_host_email: order.guestHostEmail }); };

  const addMenu = async (m: DailyMenu) => { setMenus(p => [...p, m]); await supabase.from('daily_menus').insert({ id: m.id, date: m.date, items: m.items, notes: m.notes, department_ids: m.departmentIds, company_id: currentUser?.companyId }); };
  const updateMenu = async (m: DailyMenu) => { setMenus(p => p.map(x => x.id === m.id ? m : x)); await supabase.from('daily_menus').update({ items: m.items, notes: m.notes }).eq('id', m.id); };
  const copyMenuFromDate = async (src: string, tgt: string) => { const s = menus.find(m => m.date === src); if(!s) return; const n = { ...s, id: Date.now().toString(), date: tgt }; if(menus.some(m => m.date === tgt)) { setMenus(p => p.map(m => m.date === tgt ? n : m)); await supabase.from('daily_menus').update({ items: n.items, notes: n.notes }).eq('date', tgt); } else { setMenus(p => [...p, n]); await supabase.from('daily_menus').insert({ id: n.id, date: n.date, items: n.items, notes: n.notes, company_id: currentUser?.companyId }); } };
  const saveTemplate = async (name: string, date: string, isShared: boolean) => { if (!currentUser) return; const menu = menus.find(m => m.date === date); if (!menu) return; const tpl: MenuTemplate = { id: 'tpl_' + Date.now(), name, items: menu.items, notes: menu.notes, createdById: currentUser.id, createdByName: currentUser.fullName, isShared, createdAt: new Date().toISOString(), companyId: currentUser.companyId }; setMenuTemplates(p => [tpl, ...p]); await supabase.from('menu_templates').insert({ id: tpl.id, name: tpl.name, items: tpl.items, notes: tpl.notes, created_by_id: tpl.createdById, created_by_name: tpl.createdByName, is_shared: tpl.isShared, created_at: tpl.createdAt, company_id: tpl.companyId }); };
  const loadTemplate = async (tid: string, tdate: string) => { const tpl = menuTemplates.find(t => t.id === tid); if (!tpl) return; const n = { id: Date.now().toString(), date: tdate, items: tpl.items, notes: tpl.notes }; if (menus.some(m => m.date === tdate)) { setMenus(p => p.map(m => m.date === tdate ? n : m)); await supabase.from('daily_menus').update({ items: n.items, notes: n.notes }).eq('date', tdate); } else { setMenus(p => [...p, n]); await supabase.from('daily_menus').insert({ id: n.id, date: n.date, items: n.items, notes: n.notes, company_id: currentUser?.companyId }); } };
  const deleteTemplate = async (id: string) => { setMenuTemplates(p => p.filter(t => t.id !== id)); await supabase.from('menu_templates').delete().eq('id', id); };
  const addMasterItem = async (i: MasterFoodItem) => { setMasterFoodItems(p => [...p, i]); await supabase.from('master_food_items').insert({ id: i.id, name: i.name, category: i.category, calories: i.calories, dietary_info: i.dietaryInfo, company_id: currentUser?.companyId }); };
  const updateMasterItem = async (i: MasterFoodItem) => { setMasterFoodItems(p => p.map(x => x.id === i.id ? i : x)); await supabase.from('master_food_items').update({ name: i.name, category: i.category, calories: i.calories, description: i.description, dietary_info: i.dietaryInfo }).eq('id', i.id); };
  const deleteMasterItem = async (id: string) => { setMasterFoodItems(p => p.filter(i => i.id !== id)); await supabase.from('master_food_items').delete().eq('id', id); };
  
  // USER MANAGEMENT
  const addUser = async (u: User) => { setUsers(p => [...p, u]); await supabase.from('app_users').insert({ id: u.id, username: u.username, full_name: u.fullName, role: u.role, email: u.email, department_id: u.departmentId, company_id: u.companyId }); };
  const updateUser = async (u: User) => { setUsers(p => p.map(x => x.id === u.id ? u : x)); await supabase.from('app_users').update({ username: u.username, full_name: u.fullName, role: u.role, email: u.email, department_id: u.departmentId, company_id: u.companyId }).eq('id', u.id); };
  // NEW BULK IMPORT FUNCTION
  const importUsers = async (newUsers: User[]) => {
      // 1. Optimistically update UI
      setUsers(prev => [...prev, ...newUsers]);
      
      // 2. Prepare data for Supabase (map keys to snake_case if needed, though our types match mostly)
      const dbRows = newUsers.map(u => ({
          id: u.id,
          username: u.username,
          full_name: u.fullName,
          role: u.role,
          email: u.email,
          department_id: u.departmentId,
          company_id: u.companyId,
          is_locked: false
      }));

      // 3. Bulk Insert
      await supabase.from('app_users').insert(dbRows);
  };
  const lockUser = async (id: string, l: boolean) => { setUsers(p => p.map(u => u.id === id ? { ...u, isLocked: l } : u)); await supabase.from('app_users').update({ is_locked: l }).eq('id', id); };
  
  // DEPT MANAGEMENT
  const addDepartment = async (d: Department) => { setDepartments(p => [...p, d]); await supabase.from('departments').insert({ id: d.id, name: d.name }); };
  const updateDepartment = async (d: Department) => { setDepartments(p => p.map(x => x.id === d.id ? d : x)); await supabase.from('departments').update({ name: d.name }).eq('id', d.id); };
  const deleteDepartment = async (id: string) => { setDepartments(p => p.filter(d => d.id !== id)); await supabase.from('departments').delete().eq('id', id); };

  const updateOrderStatus = async (id: string, s: Order['status']) => { setOrders(p => p.map(o => o.id === id ? { ...o, status: s } : o)); await supabase.from('orders').update({ status: s }).eq('id', id); };
  const markBatchDelivered = async (orderIds: string[]) => { setOrders(prev => prev.map(o => orderIds.includes(o.id) ? { ...o, status: 'Delivered' } : o)); for (const id of orderIds) { await supabase.from('orders').update({ status: 'Delivered' }).eq('id', id); } };

  const generateNewGuestCode = async () => { const code = 'GUEST-' + Math.floor(1000 + Math.random() * 9000); setAppConfig(prev => ({ ...prev, guestPasscode: code })); await supabase.from('app_config').update({ guest_passcode: code }).eq('id', 1); return code; };
  const updateAppConfig = async (c: AppConfig) => { setAppConfig(c); await supabase.from('app_config').update({ company_name: c.companyName, tagline: c.tagline, order_cutoff_time: c.orderCutoffTime, guest_mode: c.guestMode, guest_passcode: c.guestPasscode, guest_qr_token: c.guestQrToken }).eq('id', 1); };
  const placeOrder = async (o: Order) => { setOrders(p => [...p, o]); await supabase.from('orders').insert({ id: o.id, user_id: o.userId, menu_id: o.menuId, selected_item_ids: o.selectedItemIds, date: o.date, special_instructions: o.specialInstructions, status: o.status, timestamp: o.timestamp, company_id: currentUser?.companyId }); };
  const sendMessage = async (m: Message) => setMessages(p => [...p, m]);
  const addComment = async (c: Comment) => { setComments(p => [...p, c]); await supabase.from('comments').insert({ id: c.id, user_id: c.userId, user_name: c.userName, content: c.content, timestamp: c.timestamp }); };
  const respondToComment = async (id: string, r: string, u: User) => {
      const responseObj = { responder: u.fullName, text: r, timestamp: Date.now() };
      setComments(p => p.map(c => c.id === id ? { ...c, responses: [...c.responses, responseObj] } : c));
      const existing = comments.find(c => c.id === id);
      if(existing) { await supabase.from('comments').update({ responses: [...existing.responses, responseObj] }).eq('id', id); }
  };

  const reportIssue = async (i: MenuIssue) => { setMenuIssues(p => [...p, i]); await supabase.from('menu_issues').insert({ id: i.id, user_id: i.userId, date: i.date, issue: i.issue, status: 'Open', is_read_by_chef: false, timestamp: i.timestamp, company_id: currentUser?.companyId }); };
  const respondToIssue = async (id: string, r: string) => { setMenuIssues(p => p.map(i => i.id === id ? { ...i, chefResponse: r, status: 'Resolved' } : i)); await supabase.from('menu_issues').update({ chef_response: r, status: 'Resolved' }).eq('id', id); };
  const addCompany = async (c: Company) => { setCompanies(p => [...p, c]); await supabase.from('companies').insert({ id: c.id, name: c.name, logo_url: c.logoUrl, primary_color: c.primaryColor, secondary_color: c.secondaryColor, welcome_message: c.welcomeMessage, tagline: c.tagline }); };
  const updateCompany = async (c: Company) => { setCompanies(p => p.map(x => x.id === c.id ? c : x)); await supabase.from('companies').update({ name: c.name, logo_url: c.logoUrl, primary_color: c.primaryColor, secondary_color: c.secondaryColor, welcome_message: c.welcomeMessage, tagline: c.tagline }).eq('id', c.id); };
  const deleteCompany = async (id: string) => { setCompanies(p => p.filter(c => c.id !== id)); await supabase.from('companies').delete().eq('id', id); };
  const importData = (d: any) => {}; const exportData = () => ({ users, menus, orders });

  return (
    <StoreContext.Provider value={{
      currentUser, currentCompany, users, menus, orders, messages, comments, menuIssues, departments, appConfig, masterFoodItems, menuTemplates, companies, isLoading,
      login, logout, addMenu, updateMenu, copyMenuFromDate, saveTemplate, loadTemplate, deleteTemplate,
      addMasterItem, updateMasterItem, deleteMasterItem, lockUser, addDepartment, updateDepartment, deleteDepartment, updateOrderStatus, placeOrder, sendMessage, addComment, respondToComment, reportIssue, respondToIssue,
      addCompany, updateCompany, deleteCompany, updateAppConfig, loginAsGuest, placeGuestOrder,
      generateNewGuestCode, markBatchDelivered, addUser, updateUser, importUsers, // Added importUsers
      importData, exportData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore must be used within StoreProvider"); return context; };
