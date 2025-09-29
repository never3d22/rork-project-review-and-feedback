import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Utensils, 
  Truck, 
  MapPin, 
  Clock, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  MessageSquare,
  X 
} from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';
import { CartItem } from '@/types/restaurant';

type PaymentMethod = 'card' | 'cash' | 'online';

interface SwipeableCartItemProps {
  item: CartItem;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemove: (dishId: string) => void;
}

function SwipeableCartItem({ item, onUpdateQuantity, onRemove }: SwipeableCartItemProps) {
  const translateX = new Animated.Value(0);
  const { width } = Dimensions.get('window');
  const swipeThreshold = width * 0.3;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -swipeThreshold));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -swipeThreshold * 0.5) {
        Animated.timing(translateX, {
          toValue: -swipeThreshold,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onRemove(item.dish.id);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteAction}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 color="#fff" size={24} />
          <Text style={styles.deleteText}>Удалить</Text>
        </TouchableOpacity>
      </View>
      
      <Animated.View
        style={[styles.cartItem, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: item.dish.image }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.dish.name}</Text>
          <Text style={styles.itemPrice}>{item.dish.price} ₽</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
            >
              <Minus color="#9a4759" size={16} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
            >
              <Plus color="#9a4759" size={16} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.dish.id)}
        >
          <Trash2 color="#ff4444" size={16} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, restaurant, dishes, addToCart, createOrder, user, loginAsUser } = useRestaurant();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [utensilsCount, setUtensilsCount] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('Сразу');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [comments, setComments] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const insets = useSafeAreaInsets();

  const getRecommendedDishes = () => {
    const cartDishIds = cart.map(item => item.dish.id);
    return dishes.filter(dish => 
      dish.available && 
      !cartDishIds.includes(dish.id) &&
      dish.price <= 500
    ).slice(0, 3);
  };

  const paymentOptions = [
    { id: 'card' as PaymentMethod, title: 'Банковская карта', icon: CreditCard },
    { id: 'cash' as PaymentMethod, title: 'Наличные', icon: Banknote },
    { id: 'online' as PaymentMethod, title: 'Онлайн оплата', icon: Smartphone },
  ];

  const getDeliveryTimes = () => {
    const now = new Date();
    const times = ['Сразу'];
    
    for (let i = 0; i < 8; i++) {
      const time = new Date(now.getTime() + (i + 1) * 30 * 60000);
      times.push(time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    }
    
    return times;
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const handleLogin = () => {
    if (!userPhone.trim() || !userPassword.trim()) {
      alert('Заполните все поля');
      return;
    }
    const success = loginAsUser(userPhone, userPassword);
    if (success) {
      setShowAuthModal(false);
      setUserPhone('');
      setUserPassword('');
      handleCheckout();
    } else {
      alert('Неверные данные');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Проверяем, авторизован ли пользователь
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }

    try {
      const newOrderId = createOrder({
        items: cart,
        total: getCartTotal(),
        utensils: utensilsCount > 0,
        utensilsCount,
        paymentMethod,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
        deliveryTime,
        comments,
      });
      
      setOrderId(newOrderId);
      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при оформлении заказа');
    }
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#9a4759', '#b85a6e']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Корзина</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <ShoppingBag color="#ccc" size={80} />
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptySubtitle}>Добавьте блюда из меню</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#9a4759', '#b85a6e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Корзина</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setShowClearModal(true)}
          >
            <Trash2 color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Вкладки самовывоз/доставка */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              deliveryType === 'pickup' && styles.tabActive
            ]}
            onPress={() => setDeliveryType('pickup')}
          >
            <MapPin color={deliveryType === 'pickup' ? '#fff' : '#9a4759'} size={20} />
            <Text style={[
              styles.tabText,
              deliveryType === 'pickup' && styles.tabTextActive
            ]}>Самовывоз</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              deliveryType === 'delivery' && styles.tabActive
            ]}
            onPress={() => setDeliveryType('delivery')}
          >
            <Truck color={deliveryType === 'delivery' ? '#fff' : '#9a4759'} size={20} />
            <Text style={[
              styles.tabText,
              deliveryType === 'delivery' && styles.tabTextActive
            ]}>Доставка</Text>
          </TouchableOpacity>
        </View>



        {deliveryType === 'pickup' && (
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupText}>Адрес: {restaurant.address}</Text>
            <Text style={styles.pickupText}>Время работы: {restaurant.workingHours}</Text>
            <Text style={styles.pickupText}>Телефон: {restaurant.phone}</Text>
            
            <View style={styles.timeSection}>
              <Text style={styles.timeEstimate}>В течение {restaurant.pickupMinTime}-{restaurant.pickupMaxTime} минут</Text>
              <TouchableOpacity
                style={styles.changeTimeButton}
                onPress={() => setShowTimeModal(true)}
              >
                <Text style={styles.changeTimeText}>Изменить время самовывоза</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {deliveryType === 'delivery' && (
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Адрес доставки</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Введите адрес доставки"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />
            
            <View style={styles.timeSection}>
              <Text style={styles.timeEstimate}>В течение {restaurant.deliveryMinTime}-{restaurant.deliveryMaxTime} минут</Text>
              <TouchableOpacity
                style={styles.changeTimeButton}
                onPress={() => setShowTimeModal(true)}
              >
                <Text style={styles.changeTimeText}>Изменить время доставки</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Блюда в корзине */}
        <View style={styles.dishesSection}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          {cart.map(item => (
            <SwipeableCartItem
              key={item.dish.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </View>

        {/* Рекомендации */}
        {getRecommendedDishes().length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Добавить ещё</Text>
            <View style={styles.verticalCarousel}>
              {getRecommendedDishes().map(dish => (
                <TouchableOpacity
                  key={dish.id}
                  style={styles.recommendedDishVertical}
                  onPress={() => addToCart(dish)}
                >
                  <Image source={{ uri: dish.image }} style={styles.recommendedImageVertical} />
                  <View style={styles.recommendedInfoVertical}>
                    <Text style={styles.recommendedNameVertical} numberOfLines={2}>{dish.name}</Text>
                    <Text style={styles.recommendedPriceVertical}>{dish.price} ₽</Text>
                  </View>
                  <View style={styles.addRecommendedButtonVertical}>
                    <Plus color="#fff" size={16} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Приборы */}
        <View style={styles.utensilsSection}>
          <View style={styles.utensilsHeader}>
            <Utensils color="#333" size={20} />
            <Text style={styles.sectionTitle}>Приборы</Text>
          </View>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setUtensilsCount(Math.max(0, utensilsCount - 1))}
            >
              <Minus color="#9a4759" size={16} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{utensilsCount}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setUtensilsCount(utensilsCount + 1)}
            >
              <Plus color="#9a4759" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Комментарий */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <MessageSquare color="#333" size={20} />
            <Text style={styles.sectionTitle}>Комментарий к заказу</Text>
          </View>
          <TextInput
            style={styles.commentsInput}
            placeholder="Особые пожелания к заказу..."
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Способ оплаты */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          {paymentOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && styles.paymentOptionActive
                ]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <IconComponent 
                  color={paymentMethod === option.id ? '#9a4759' : '#666'} 
                  size={24} 
                />
                <Text style={[
                  styles.paymentOptionText,
                  paymentMethod === option.id && styles.paymentOptionTextActive
                ]}>
                  {option.title}
                </Text>
                <View style={[
                  styles.radioButton,
                  paymentMethod === option.id && styles.radioButtonActive
                ]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Итого:</Text>
          <Text style={styles.totalAmount}>{getCartTotal()} ₽</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Очистить корзину?</Text>
            <Text style={styles.modalText}>Все товары будут удалены из корзины</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowClearModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleClearCart}
              >
                <Text style={styles.modalButtonConfirmText}>Очистить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.timeModalContainer}>
          <View style={styles.timeModalHeader}>
            <Text style={styles.timeModalTitle}>Выберите время</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimeModal(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.timeModalContent} showsVerticalScrollIndicator={false}>
            {getDeliveryTimes().map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeModalItem,
                  deliveryTime === time && styles.timeModalItemActive
                ]}
                onPress={() => {
                  setDeliveryTime(time);
                  setShowTimeModal(false);
                }}
              >
                <Text style={[
                  styles.timeModalItemText,
                  deliveryTime === time && styles.timeModalItemTextActive
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Войдите для оформления заказа</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Номер телефона"
              value={userPhone}
              onChangeText={setUserPhone}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={userPassword}
              onChangeText={setUserPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAuthModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleLogin}
              >
                <Text style={styles.modalButtonConfirmText}>Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Заказ оформлен!</Text>
            <Text style={styles.modalText}>Ваш заказ №{orderId} принят в обработку. Мы свяжемся с вами в ближайшее время.</Text>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonConfirmText}>Отлично!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#9a4759',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9a4759',
  },
  tabTextActive: {
    color: '#fff',
  },
  timeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeEstimate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  changeTimeButton: {
    paddingVertical: 8,
  },
  changeTimeText: {
    fontSize: 14,
    color: '#9a4759',
    textDecorationLine: 'underline' as const,
  },
  timeModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  timeModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeModalItem: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeModalItemActive: {
    backgroundColor: '#f8f9fa',
  },
  timeModalItemText: {
    fontSize: 18,
    color: '#333',
  },
  timeModalItemTextActive: {
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 8,
  },
  pickupInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickupText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  dishesSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#9a4759',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    minWidth: 20,
    textAlign: 'center' as const,
  },
  removeButton: {
    padding: 4,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendedDish: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  recommendedImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendedName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: 4,
    height: 32,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#9a4759',
    marginBottom: 8,
  },
  addRecommendedButton: {
    backgroundColor: '#9a4759',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalCarousel: {
    gap: 12,
  },
  recommendedDishVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 12,
  },
  recommendedImageVertical: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  recommendedInfoVertical: {
    flex: 1,
  },
  recommendedNameVertical: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  recommendedPriceVertical: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  addRecommendedButtonVertical: {
    backgroundColor: '#9a4759',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utensilsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  utensilsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  commentsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  commentsInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    gap: 12,
  },
  paymentOptionActive: {
    borderColor: '#9a4759',
    backgroundColor: '#f8f9fa',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  paymentOptionTextActive: {
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  radioButtonActive: {
    borderColor: '#9a4759',
    backgroundColor: '#9a4759',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  checkoutButton: {
    backgroundColor: '#9a4759',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#9a4759',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 1,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
});