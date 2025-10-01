import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { CartItem, Dish, Order, User, Restaurant, Category } from '@/types/restaurant';
import { MOCK_DISHES, MOCK_CATEGORIES } from '@/constants/dishes';
import { trpcClient } from '@/lib/trpc';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log('Notifications setup error:', error);
}

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
    logo: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/i3drirnswip2jkkao4snr',
  });
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const previousOrdersCountRef = useRef<number>(0);

  // Load restaurant data from storage on mount
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const restaurantData = await storage.getItem('restaurant');
        if (restaurantData) {
          setRestaurant(JSON.parse(restaurantData));
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      }
    };
    loadRestaurant();
  }, []);

  // Save restaurant to storage whenever it changes
  useEffect(() => {
    storage.setItem('restaurant', JSON.stringify(restaurant));
  }, [restaurant]);

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
          previousOrdersCountRef.current = parsedOrders.length;
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
  
  const playNotificationSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      soundRef.current = sound;
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  }, []);
  
  const sendNotification = useCallback(async (order: Order) => {
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Новый заказ!', {
            body: `Заказ #${order.id} на сумму ${order.total} ₽`,
            icon: restaurant.logo,
            tag: order.id,
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          await Notification.requestPermission();
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Новый заказ!',
            body: `Заказ #${order.id} на сумму ${order.total} ₽`,
            data: { orderId: order.id },
            sound: true,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  }, [restaurant.logo]);
  
  // Setup notifications
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS !== 'web') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }
      }
    };
    
    setupNotifications();
  }, []);
  
  // Monitor new orders and send notifications
  useEffect(() => {
    const checkNewOrders = async () => {
      if (!user?.isAdmin) return;
      
      const currentOrdersCount = orders.length;
      const previousCount = previousOrdersCountRef.current;
      
      if (currentOrdersCount > previousCount && previousCount > 0) {
        const newOrders = orders.slice(0, currentOrdersCount - previousCount);
        
        for (const order of newOrders) {
          if (order.status === 'pending') {
            await playNotificationSound();
            await sendNotification(order);
          }
        }
      }
      
      previousOrdersCountRef.current = currentOrdersCount;
    };
    
    checkNewOrders();
  }, [orders, user, playNotificationSound, sendNotification]);

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

  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    console.log('\n🔍 [STORE] createOrder called with:', JSON.stringify({
      itemsCount: orderData.items.length,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      deliveryType: orderData.deliveryType,
      utensils: orderData.utensils,
      utensilsCount: orderData.utensilsCount,
      comments: orderData.comments,
      deliveryAddress: orderData.deliveryAddress,
    }, null, 2));
    
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      userId: user?.id,
      userName: user?.name,
      userPhone: user?.phone,
    };
    
    console.log('\n🔍 [STORE] newOrder created:', JSON.stringify({
      id: newOrder.id,
      paymentMethod: newOrder.paymentMethod,
      deliveryType: newOrder.deliveryType,
      total: newOrder.total,
      userId: newOrder.userId,
      userName: newOrder.userName,
      userPhone: newOrder.userPhone,
    }, null, 2));
    
    let savedToDatabase = false;
    
    const getApiBaseUrl = () => {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app';
    };
    
    const baseUrl = getApiBaseUrl();
    
    try {
      console.log('\n========================================');
      console.log('🔵 [CLIENT] Starting order creation');
      console.log('========================================');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Base URL:', baseUrl);
      console.log('Order data:', JSON.stringify({
        userId: newOrder.userId,
        userName: newOrder.userName,
        userPhone: newOrder.userPhone,
        itemsCount: newOrder.items.length,
        total: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        deliveryType: newOrder.deliveryType,
      }, null, 2));
      
      console.log('\n📝 [CLIENT] Step 1: Testing API health...');
      const testResponse = await fetch(`${baseUrl}/api`, {
        method: 'GET',
      });
      console.log('API Health Check Status:', testResponse.status);
      console.log('API Health Check OK:', testResponse.ok);
      
      if (testResponse.ok) {
        const healthData = await testResponse.json();
        console.log('API Health Response:', healthData);
      }
      
      console.log('\n📝 [CLIENT] Step 2: Preparing tRPC mutation...');
      const mutationData = {
        userId: newOrder.userId,
        userName: newOrder.userName,
        userPhone: newOrder.userPhone,
        items: newOrder.items,
        total: newOrder.total,
        utensils: newOrder.utensils,
        utensilsCount: newOrder.utensilsCount,
        paymentMethod: newOrder.paymentMethod,
        deliveryType: newOrder.deliveryType,
        deliveryAddress: newOrder.deliveryAddress,
        deliveryTime: newOrder.deliveryTime,
        comments: newOrder.comments || '',
      };
      console.log('Mutation data prepared:', JSON.stringify(mutationData, null, 2));
      
      console.log('\n📝 [CLIENT] Step 3: Calling tRPC mutation...');
      console.log('tRPC URL:', `${baseUrl}/api/trpc`);
      
      const result = await trpcClient.orders.create.mutate(mutationData);
      
      savedToDatabase = true;
      console.log('\n✅ [CLIENT] Order saved to database successfully!');
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log('========================================\n');
    } catch (error: any) {
      console.error('\n========================================');
      console.error('❌ [CLIENT] Error saving order to database');
      console.error('========================================');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error cause:', error?.cause);
      console.error('Error name:', error?.name);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      if (error?.message?.includes('fetch')) {
        console.error('\n⚠️ [CLIENT] Network connection issue detected');
        console.error('Checklist:');
        console.error('1. API URL:', baseUrl);
        console.error('2. Server availability');
        console.error('3. CORS settings');
        console.error('4. Vercel environment variables');
        console.error('5. Network connectivity');
      }
      
      console.error('\n⚠️ [CLIENT] Order will be saved locally only');
      console.error('========================================\n');
    }
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    
    if (!savedToDatabase) {
      console.log('📝 Заказ сохранен только локально. Требуется настройка backend на Vercel.');
    }
    
    clearCart();
    
    return newOrder.id;
  }, [user, clearCart]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const cancelOrder = useCallback((orderId: string, reason?: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { 
          ...order, 
          status: 'cancelled' as Order['status'],
          cancelReason: reason,
          cancelledAt: new Date()
        } : order
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

  const addAddress = useCallback((address: string) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const currentAddresses = prevUser.addresses || [];
      if (currentAddresses.includes(address)) return prevUser;
      return { ...prevUser, addresses: [...currentAddresses, address] };
    });
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
    setRestaurant(prevRestaurant => {
      const updated = { ...prevRestaurant, ...updates };
      console.log('Updating restaurant:', updated);
      return updated;
    });
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

  const reorderCategories = useCallback((newOrder: Category[]) => {
    setCategories(newOrder);
  }, []);

  const toggleCategoryVisibility = useCallback((categoryId: string) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId ? { ...category, visible: category.visible === false ? true : false } : category
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
      const SMS_API_ID = '457A5DBA-D814-BC10-DDD7-645DC659658E';
      const message = `Ваш код подтверждения: ${code}`;
      
      console.log(`\n========================================`);
      console.log(`📱 ОТПРАВКА SMS`);
      console.log(`Номер: ${phone}`);
      console.log(`Код: ${code}`);
      console.log(`API ID: ${SMS_API_ID}`);
      console.log(`========================================\n`);
      
      // Форматируем номер для SMS.ru (должен начинаться с 7)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('7')) {
        formattedPhone = '7' + formattedPhone;
      }
      
      console.log('Форматированный номер:', formattedPhone);
      
      // Отправляем SMS через SMS.ru API
      const smsUrl = `https://sms.ru/sms/send?api_id=${SMS_API_ID}&to=${formattedPhone}&msg=${encodeURIComponent(message)}&json=1`;
      
      console.log('Отправляем запрос на SMS.ru...');
      console.log('URL:', smsUrl.replace(SMS_API_ID, 'API_ID_HIDDEN'));
      
      const response = await fetch(smsUrl, {
        method: 'GET',
      });
      
      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Ответ от SMS.ru:', JSON.stringify(result, null, 2));
        
        if (result.status === 'OK') {
          console.log('✅ SMS успешно отправлено!');
          return true;
        } else {
          console.error('❌ Ошибка SMS.ru:', result.status_text || result.status);
          if (result.status_code) {
            console.error('Код ошибки:', result.status_code);
          }
          console.log(`\n⚠️ [ДЕМО РЕЖИМ] Используйте код из консоли: ${code}\n`);
          return true;
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP ошибка:', response.status, response.statusText);
        console.error('Тело ответа:', errorText);
        console.log(`\n⚠️ [ДЕМО РЕЖИМ] Используйте код из консоли: ${code}\n`);
        return true;
      }
      
    } catch (error) {
      console.error('❌ Ошибка при отправке SMS:', error);
      console.log(`\n⚠️ [ДЕМО РЕЖИМ] Используйте код из консоли: ${code}\n`);
      return true;
    }
  }, []);

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
    cancelOrder,
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
    reorderCategories,
    toggleCategoryVisibility,
    sendSMSCode,
    verifySMSCode,
    addAddress,
  };
});