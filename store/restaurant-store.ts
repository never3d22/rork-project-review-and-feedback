import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { CartItem, Dish, Order, User, Restaurant, Category } from '@/types/restaurant';
import { MOCK_DISHES, MOCK_CATEGORIES } from '@/constants/dishes';

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
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [pendingSMSCodes, setPendingSMSCodes] = useState<Map<string, { code: string; timestamp: number }>>(new Map());
  const [restaurant, setRestaurant] = useState<Restaurant>({
    id: '1',
    name: 'Вкусная еда',
    address: 'ул. Пушкина, д. 10',
    phone: '+7 (999) 123-45-67',
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-45 мин',
    pickupTime: '25-35 мин',
    deliveryMinTime: 30,
    deliveryMaxTime: 45,
    pickupMinTime: 25,
    pickupMaxTime: 35,
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

  const removeFromCart = useCallback((dishId: string) => {
    setCart(prevCart => prevCart.filter(item => item.dish.id !== dishId));
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
  }, [removeFromCart]);

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
    return newOrder.id;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const loginAsAdmin = useCallback((username: string, password: string) => {
    if (username === 'admin' && password === '1234') {
      setUser({
        id: 'admin',
        name: 'Администратор',
        email: 'admin@restaurant.com',
        isAdmin: true,
      });
      return true;
    }
    return false;
  }, []);

  const loginAsUser = useCallback((phone: string, password: string) => {
    // Простая проверка для тестирования
    if (phone && password) {
      setUser({
        id: Date.now().toString(),
        name: 'Пользователь',
        email: phone,
        isAdmin: false,
        addresses: [],
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  const addDish = useCallback((dish: Omit<Dish, 'id'>) => {
    const newDish: Dish = {
      ...dish,
      id: Date.now().toString(),
    };
    setDishes(prevDishes => [...prevDishes, newDish]);
  }, []);

  const updateDish = useCallback((dishId: string, updates: Partial<Dish>) => {
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === dishId ? { ...dish, ...updates } : dish
      )
    );
  }, []);

  const deleteDish = useCallback((dishId: string) => {
    setDishes(prevDishes => prevDishes.filter(dish => dish.id !== dishId));
  }, []);

  const toggleDishVisibility = useCallback((dishId: string) => {
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === dishId ? { ...dish, available: !dish.available } : dish
      )
    );
  }, []);

  const updateRestaurant = useCallback((updates: Partial<Restaurant>) => {
    setRestaurant(prevRestaurant => ({ ...prevRestaurant, ...updates }));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prevCategories => [...prevCategories, newCategory]);
  }, []);

  const updateCategory = useCallback((categoryId: string, updates: Partial<Category>) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId ? { ...category, ...updates } : category
      )
    );
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
  }, []);

  // Функция для получения IP адреса пользователя
  const getUserIP = useCallback(async (): Promise<string> => {
    try {
      // Для веб-платформы используем внешний сервис
      if (Platform.OS === 'web') {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || '';
      }
      
      // Для мобильных платформ также используем внешний сервис
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      console.log('Не удалось получить IP адрес:', error);
      return '';
    }
  }, []);

  // Функция для отправки реального SMS
  const sendRealSMS = useCallback(async (phone: string, code: string): Promise<boolean> => {
    try {
      const SMS_API_ID = process.env.EXPO_PUBLIC_SMS_API_ID || '457A5DBA-D814-BC10-DDD7-645DC659658E';
      const message = `Ваш код подтверждения: ${code}`;
      
      console.log(`Отправляем SMS на номер ${phone} с кодом: ${code}`);
      
      // Получаем IP адрес пользователя
      const userIP = await getUserIP();
      console.log('IP адрес пользователя:', userIP);
      
      // Форматируем номер для SMS.ru (должен начинаться с 7)
      const formattedPhone = phone.startsWith('8') ? '7' + phone.slice(1) : phone;
      
      // Отправляем SMS через SMS.ru API с IP адресом
      let smsUrl = `https://sms.ru/sms/send?api_id=${SMS_API_ID}&to=${formattedPhone}&msg=${encodeURIComponent(message)}&json=1`;
      
      // Добавляем IP адрес если удалось его получить
      if (userIP) {
        smsUrl += `&ip=${userIP}`;
      }
      
      console.log('Отправляем запрос на:', smsUrl);
      
      const response = await fetch(smsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Ответ от SMS.ru:', result);
        
        if (result.status === 'OK') {
          console.log('SMS успешно отправлено!');
          return true;
        } else {
          console.error('Ошибка SMS.ru:', result.status_text || result.status);
          // В случае ошибки API показываем код в консоли для тестирования
          console.log(`[FALLBACK] SMS код для тестирования: ${code}`);
          return true;
        }
      } else {
        console.error('HTTP ошибка:', response.status, response.statusText);
        // В случае HTTP ошибки показываем код в консоли для тестирования
        console.log(`[FALLBACK] SMS код для тестирования: ${code}`);
        return true;
      }
      
    } catch (error) {
      console.error('Ошибка при отправке SMS:', error);
      
      // Fallback: показываем код в консоли
      console.log(`[ERROR FALLBACK] SMS код для ${phone}: ${code}`);
      console.log('Произошла ошибка при отправке SMS. Используйте код из консоли.');
      return true; // Возвращаем true чтобы пользователь мог продолжить
    }
  }, [getUserIP]);

  const sendSMSCode = useCallback(async (phone: string): Promise<boolean> => {
    try {
      // Генерируем 6-значный код
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Сохраняем код с временной меткой (действителен 5 минут)
      const newCodes = new Map(pendingSMSCodes);
      newCodes.set(phone, {
        code,
        timestamp: Date.now() + 5 * 60 * 1000 // 5 минут
      });
      setPendingSMSCodes(newCodes);
      
      // Отправляем реальное SMS
      const success = await sendRealSMS(phone, code);
      
      // В демо-режиме всегда считаем отправку успешной
      if (success) {
        console.log(`SMS код сохранен для ${phone}`);
        return true;
      }
      
      // Если не удалось отправить SMS, все равно оставляем код для демо
      console.log(`SMS не отправлено, но код доступен в консоли для ${phone}`);
      return true;
      
    } catch (error) {
      console.error('Ошибка при отправке SMS:', error);
      
      // Даже при ошибке генерируем код для демо-режима
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newCodes = new Map(pendingSMSCodes);
      newCodes.set(phone, {
        code,
        timestamp: Date.now() + 5 * 60 * 1000
      });
      setPendingSMSCodes(newCodes);
      
      console.log(`[DEMO] SMS код для ${phone}: ${code}`);
      return true;
    }
  }, [pendingSMSCodes, sendRealSMS]);



  const verifySMSCode = useCallback(async (phone: string, inputCode: string): Promise<boolean> => {
    try {
      const storedData = pendingSMSCodes.get(phone);
      
      if (!storedData) {
        console.log('Код не найден для номера:', phone);
        return false;
      }
      
      // Проверяем, не истек ли код
      if (Date.now() > storedData.timestamp) {
        console.log('Код истек для номера:', phone);
        // Удаляем истекший код
        const newCodes = new Map(pendingSMSCodes);
        newCodes.delete(phone);
        setPendingSMSCodes(newCodes);
        return false;
      }
      
      // Проверяем код
      if (storedData.code === inputCode) {
        // Код верный, создаем пользователя
        const newUser: User = {
          id: Date.now().toString(),
          name: 'Пользователь',
          email: phone,
          phone: phone,
          isAdmin: false,
          addresses: [],
        };
        
        setUser(newUser);
        
        // Удаляем использованный код
        const newCodes = new Map(pendingSMSCodes);
        newCodes.delete(phone);
        setPendingSMSCodes(newCodes);
        
        return true;
      }
      
      console.log('Неверный код для номера:', phone);
      return false;
    } catch (error) {
      console.error('Ошибка проверки SMS кода:', error);
      return false;
    }
  }, [pendingSMSCodes]);

  return {
    dishes,
    cart,
    orders,
    user,
    restaurant,
    categories,
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
    updateRestaurant,
    addCategory,
    updateCategory,
    deleteCategory,
    sendSMSCode,
    verifySMSCode,
  };
});