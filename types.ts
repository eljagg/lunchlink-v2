export enum UserRole {
  EMPLOYEE = 'employee',
  KITCHEN_ADMIN = 'kitchen_admin',
  SUPER_ADMIN = 'super_admin', // CHANGED FROM 'SUPER_ADMIN' TO 'super_admin'
  HR = 'hr',
  DELIVERY = 'delivery',
  RECEPTIONIST = 'receptionist',
  GUEST = 'guest'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  companyId?: string;
  email?: string;
  isLocked?: boolean;
  avatarUrl?: string;
  departmentId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string; 
  calories: number;
  image_url?: string;
  is_halal?: boolean;
  is_vegetarian?: boolean;
  dietaryInfo?: string[];
}

export interface MasterFoodItem extends MenuItem {
  isAvailable?: boolean;
}

export interface DailyMenu {
  id: string;
  date: string;
  items: MenuItem[];
  notes: string;
  departmentIds?: string[];
  companyId?: string;
}

export interface Order {
  id: string;
  userId?: string;
  menuId: string;
  selectedItemIds: string[];
  date: string;
  specialInstructions?: string;
  status: 'Pending' | 'In Progress' | 'Ready' | 'Delivered' | 'Cancelled' | 'Confirmed';
  timestamp: number;
  companyId?: string;
  guestName?: string;
  guestHostEmail?: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  tagline?: string;
}

export interface AppConfig {
  companyName: string;
  tagline: string;
  logoUrl?: string;
  orderCutoffTime?: string;
  guestMode?: string;
  guestPasscode?: string;
  guestQrToken?: string;
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
  companyId?: string;
}

export interface MenuTemplate {
  id: string;
  name: string;
  items: MenuItem[];
  notes: string;
  createdById: string;
  createdByName: string;
  isShared: boolean;
  createdAt: string;
  companyId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName?: string;
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

export type MenuCategory = 'Protein' | 'Carbohydrate' | 'Sides' | 'Fibre' | 'Soup' | 'Vegetarian' | 'Sandwiches' | 'Special' | 'Condiments' | 'Drink' | 'Dessert';
