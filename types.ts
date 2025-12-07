export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  KITCHEN_ADMIN = 'KITCHEN_ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export type MenuCategory = 'Protein' | 'Carbohydrate' | 'Sides' | 'Fibre' | 'Soup' | 'Vegetarian' | 'Sandwiches' | 'Special' | 'Condiments';

// --- NEW COMPANY INTERFACE ---
// ... (Keep existing Enums)

// UPDATED COMPANY INTERFACE
export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage: string;
  tagline?: string; // <--- NEW FIELD
}

// ... (Keep the rest of the file exactly as it was)
export enum UserRole { SUPER_ADMIN = 'SUPER_ADMIN', KITCHEN_ADMIN = 'KITCHEN_ADMIN', HR = 'HR', EMPLOYEE = 'EMPLOYEE' }
export type MenuCategory = 'Protein' | 'Carbohydrate' | 'Sides' | 'Fibre' | 'Soup' | 'Vegetarian' | 'Sandwiches' | 'Special' | 'Condiments';
export interface MenuItem { id: string; name: string; description: string; category: string; calories: number; dietaryInfo?: string[]; companyId?: string; }
export interface MasterFoodItem extends MenuItem { isAvailable?: boolean; }
export interface DailyMenu { id: string; date: string; items: MenuItem[]; notes?: string; departmentIds?: string[]; isClosed?: boolean; companyId?: string; }
export interface Order { id: string; userId: string; menuId: string; selectedItemIds: string[]; date: string; specialInstructions?: string; status: 'Pending' | 'Confirmed' | 'Fulfilled' | 'Cancelled'; timestamp: number; companyId?: string; }
export interface MenuIssue { id: string; userId: string; date: string; issue: string; status: 'Open' | 'Resolved'; chefResponse?: string; isReadByChef: boolean; timestamp: number; companyId?: string; }
export interface User { id: string; username: string; fullName: string; role: UserRole; departmentId?: string; email: string; isLocked: boolean; avatarUrl?: string; companyId?: string; }
export interface Department { id: string; name: string; }
export interface Message { id: string; fromUserId: string; fromUserName: string; toUserId: string; content: string; timestamp: number; read: boolean; }
export interface Comment { id: string; userId: string; userName: string; content: string; timestamp: number; responses: any[]; }
export interface AppConfig { companyName: string; tagline: string; logoUrl: string; orderCutoffTime: string; }
export interface MenuTemplate { id: string; name: string; items: MenuItem[]; notes?: string; createdById: string; createdByName: string; isShared: boolean; createdAt: string; companyId?: string; }

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  calories: number;
  dietaryInfo?: string[];
  companyId?: string; // Link to company
}

export interface MasterFoodItem extends MenuItem {
  isAvailable?: boolean;
}

export interface DailyMenu {
  id: string;
  date: string;
  items: MenuItem[];
  notes?: string;
  departmentIds?: string[];
  isClosed?: boolean;
  companyId?: string; // Link to company
}

export interface Order {
  id: string;
  userId: string;
  menuId: string;
  selectedItemIds: string[];
  date: string;
  specialInstructions?: string;
  status: 'Pending' | 'Confirmed' | 'Fulfilled' | 'Cancelled';
  timestamp: number;
  companyId?: string; // Link to company
}

export interface MenuIssue {
  id: string;
  userId: string;
  date: string;
  issue: string;
  status: 'Open' | 'Resolved';
  chefResponse?: string;
  isReadByChef: boolean;
  timestamp: number;
  companyId?: string; // Link to company
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  email: string;
  isLocked: boolean;
  avatarUrl?: string;
  companyId?: string; // Critical: Links user to their tenant
}

export interface Department {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  responses: any[];
}

export interface AppConfig {
  companyName: string;
  tagline: string;
  logoUrl: string;
  orderCutoffTime: string;
}

export interface MenuTemplate {
  id: string;
  name: string;
  items: MenuItem[];
  notes?: string;
  createdById: string;
  createdByName: string;
  isShared: boolean;
  createdAt: string;
  companyId?: string; // Link to company
}
