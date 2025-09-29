import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { CartItem, Dish, Order, User, Restaurant } from '@/types/restaurant';
import { MOCK_DISHES } from '@/constants/dishes';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (!key?.trim() || key.length > 100) return null;
    const sanitizedKey = key.trim();
    
    if (Platform.OS === 'web') {
      return localStorage.getItem(sanitizedKey);
    }
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.getItem(sanitizedKey);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!key?.trim() || key.length > 100 || !value?.trim()) return;
    const sanitizedKey = key.trim();
    const sanitizedValue = value.trim();
    
    if (Platform.OS === 'web') {
      localStorage.setItem(sanitizedKey, sanitizedValue);
      return;
    }
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.setItem(sanitizedKey, sanitizedValue);
  },
  async removeItem(key: string): Promise<void> {
    if (!key?.trim() || key.length > 100) return;
    const sanitizedKey = key.trim();
    
    if (Platform.OS === 'web') {
      localStorage.removeItem(sanitizedKey);
      return;
    }
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.removeItem(sanitizedKey);
  },
};

export const [RestaurantProvider, useRestaurant] = createContextHook(() => {
  const [dishes, setDishes] = useState<Dish[]>(MOCK_DISHES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant] = useState<Restaurant>({
    id: '1',
    name: 'Вкусная еда',
    address: 'ул. Пушкина, д. 10',
    phone: '+7 (999) 123-45-67',
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-45 мин',
  });

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const cartData = await storage.getItem('cart');
        const ordersData = await storage.getItem('orders');
        const userData = await storage.getItem('user');
        
        if (cartData) {
          setCart(JSON.parse(cartData));
        }
        if (ordersData) {
          const parsedOrders = JSON.parse(ordersData).map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt),
          }));
          setOrders(parsedOrders);
        }
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    storage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save orders to storage whenever they change
  useEffect(() => {
    storage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Save user to storage whenever it changes
  useEffect(() => {
    if (user) {
      storage.setItem('user', JSON.stringify(user));
    } else {
      storage.removeItem('user');
    }
  }, [user]);

  const addToCart = useCallback((dish: Dish) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish.id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { dish, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    setCart(prevCart => prevCart.filter(item => item.dish.id !== dishId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.dish.price * item.quantity, 0);
  }, [cart]);

  const createOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    return newOrder.id;
  }, [clearCart]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const loginAsAdmin = useCallback(() => {
    setUser({
      id: 'admin',
      name: 'Администратор',
      email: 'admin@restaurant.com',
      isAdmin: true,
    });
  }, []);

  const loginAsUser = useCallback((name: string, email: string) => {
    setUser({
      id: Date.now().toString(),
      name,
      email,
      isAdmin: false,
      addresses: [],
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  const addDish = useCallback((dish: Omit<Dish, 'id'>) => {
    // This would normally be handled by the backend
    console.log('Add dish:', dish);
  }, []);

  const updateDish = useCallback((dishId: string, updates: Partial<Dish>) => {
    // This would normally be handled by the backend
    console.log('Update dish:', dishId, updates);
  }, []);

  const deleteDish = useCallback((dishId: string) => {
    // This would normally be handled by the backend
    console.log('Delete dish:', dishId);
  }, []);

  const toggleDishVisibility = useCallback((dishId: string) => {
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === dishId ? { ...dish, available: !dish.available } : dish
      )
    );
  }, []);

  return {
    dishes,
    cart,
    orders,
    user,
    restaurant,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    createOrder,
    updateOrderStatus,
    loginAsAdmin,
    loginAsUser,
    logout,
    updateUser,
    addDish,
    updateDish,
    deleteDish,
    toggleDishVisibility,
  };
});