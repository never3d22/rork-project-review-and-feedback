export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
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
  paymentMethod: 'card' | 'cash' | 'online';
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  comments: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
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
}

export interface Category {
  id: string;
  name: string;
  order: number;
}