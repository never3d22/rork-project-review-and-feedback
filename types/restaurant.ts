export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  weight?: string;
  ingredients?: string[];
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  utensils: boolean;
  utensilsCount: number;
  paymentMethod: 'card' | 'sberpay' | 'cash' | 'sbp';
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryTime?: string;
  comments: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  cancelReason?: string;
  cancelledAt?: Date;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  isAdmin: boolean;
  addresses?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  deliveryTime: string;
  pickupTime: string;
  deliveryMinTime: number;
  deliveryMaxTime: number;
  pickupMinTime: number;
  pickupMaxTime: number;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  visible?: boolean;
}