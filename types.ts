// ============================================================================
// 1. TYPES DEFINITION (The "Contract")
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  KITCHEN_ADMIN = 'KITCHEN_ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
  GUEST = 'GUEST' // <--- New Role for Guest Logic
}

// Columns for the Menu Grid
export type MenuCategory = 'Protein' | 'Carbohydrate' | 'Sides' | 'Fibre' | 'Soup' | 'Vegetarian' | 'Sandwiches' | 'Special' | 'Condiments';

// --- COMPANY & BRANDING ---
export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage: string;
  tagline?: string;
}

// --- FOOD ITEMS ---
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  calories: number;
  dietaryInfo?: string[]; // e.g. ['Vegan', 'Spicy']
  companyId?: string;
}

export interface MasterFoodItem extends MenuItem {
  isAvailable?: boolean;
}

// --- MENUS ---
export interface DailyMenu {
  id: string;
  date: string; // YYYY-MM-DD
  items: MenuItem[];
  notes?: string;
  departmentIds?: string[];
  isClosed?: boolean;
  companyId?: string;
}

// --- MENU TEMPLATES (The Bank) ---
export interface MenuTemplate {
  id: string;
  name: string;
  items: MenuItem[];
  notes?: string;
  createdById: string;
  createdByName: string;
  isShared: boolean;
  createdAt: string;
  companyId?: string;
}

// --- ORDERS ---
export interface Order {
  id: string;
  userId?: string; // Made Optional for Guests
  guestName?: string; // <--- New: For Guest Orders
  guestHostEmail?: string; // <--- New: Who they are visiting
  menuId: string;
  selectedItemIds: string[];
  date: string;
  specialInstructions?: string;
  status: 'Pending' | 'Confirmed' | 'Fulfilled' | 'Cancelled';
  timestamp: number;
  companyId?: string;
}

// --- ISSUES & FEEDBACK ---
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

// --- USERS & DEPTS ---
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  email: string;
  isLocked: boolean;
  avatarUrl?: string;
  companyId?: string;
}

export interface Department {
  id: string;
  name: string;
}

// --- GLOBAL CONFIG ---
export interface AppConfig {
  companyName: string;
  tagline: string;
  logoUrl: string;
  orderCutoffTime: string;
  // New Guest Settings
  guestMode: 'PASSCODE' | 'HOST' | 'QR';
  guestPasscode: string;
  guestQrToken: string;
}
