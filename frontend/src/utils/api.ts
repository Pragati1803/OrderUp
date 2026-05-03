import axios from 'axios';

const api = axios.create({
  baseURL: 'https://orderup-iubh.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orderup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('orderup_token');
      localStorage.removeItem('orderup_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  canteen?: string;
  phone?: string;
  loyaltyPoints?: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  canteen: string;
  isAvailable: boolean;
  prepTime: number;
  ratings: number;
  isVeg: boolean;
}

export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  tokenNumber: string;
  user: User | string;
  canteen: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  estimatedTime: number;
  queuePosition: number;
  specialInstructions?: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
  createdAt: string;
}

export const CANTEENS = [
  'PSIT 2004', 'Nescafe', 'Amul', 'Samocha', 
  'Urban Vada Pao', 'Che-Canteen', 'Nescafe-CHE'
] as const;

export const CANTEEN_DESCRIPTIONS: Record<string, string> = {
  'PSIT 2004': 'Full meals & thalis',
  'Nescafe': 'Coffee & snacks',
  'Amul': 'Dairy & cold treats',
  'Samocha': 'North Indian street food',
  'Urban Vada Pao': 'Mumbai street food',
  'Che-Canteen': 'Continental & healthy',
  'Nescafe-CHE': 'Premium coffee & bakery',
};

export const CANTEEN_EMOJIS: Record<string, string> = {
  'PSIT 2004': '🍽️',
  'Nescafe': '☕',
  'Amul': '🧊',
  'Samocha': '🥘',
  'Urban Vada Pao': '🫓',
  'Che-Canteen': '🥗',
  'Nescafe-CHE': '☕',
};

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting Payment',
  pending: 'Order Placed',
  accepted: 'Order Accepted',
  preparing: 'Being Prepared',
  ready: 'Ready for Pickup!',
  completed: 'Collected',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
