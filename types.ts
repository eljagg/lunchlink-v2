export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  KITCHEN_ADMIN = 'KITCHEN_ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export type MenuCategory = 'Protein' | 'Carbohydrate' | 'Sides' | 'Fibre' | 'Soup' | 'Vegetarian' | 'Sandwiches' | 'Special' | 'Condiments';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  calories: number;
  dietaryInfo?: string[]; // e.g. ['Vegan', 'Spicy']
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
  orderCutoffTime: string; // NEW: e.g. "10:30"
}