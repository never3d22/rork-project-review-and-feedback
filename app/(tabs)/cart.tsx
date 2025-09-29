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
  MessageSquare 
} from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';

type PaymentMethod = 'card' | 'cash' | 'online';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, restaurant, dishes, addToCart, createOrder } = useRestaurant();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [utensilsCount, setUtensilsCount] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('Сразу');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [comments, setComments] = useState('');
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }

    try {
      const newOrderId = createOrder({
        items: cart,
        total: getCartTotal(),
        utensils: utensilsCount > 0,
        paymentMethod,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
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

        {/* Время доставки/самовывоза */}
        <View style={styles.timeSection}>
          <View style={styles.timeHeader}>
            <Clock color="#333" size={20} />
            <Text style={styles.sectionTitle}>Время {deliveryType === 'pickup' ? 'самовывоза' : 'доставки'}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeOptions}>
            {getDeliveryTimes().map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeOption,
                  deliveryTime === time && styles.timeOptionActive
                ]}
                onPress={() => setDeliveryTime(time)}
              >
                <Text style={[
                  styles.timeOptionText,
                  deliveryTime === time && styles.timeOptionTextActive
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {deliveryType === 'pickup' && (
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupText}>Адрес: {restaurant.address}</Text>
            <Text style={styles.pickupText}>Время работы: {restaurant.workingHours}</Text>
            <Text style={styles.pickupText}>Телефон: {restaurant.phone}</Text>
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
          </View>
        )}

        {/* Блюда в корзине */}
        <View style={styles.dishesSection}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          {cart.map(item => (
            <View key={item.dish.id} style={styles.cartItem}>
              <Image source={{ uri: item.dish.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.dish.name}</Text>
                <Text style={styles.itemPrice}>{item.dish.price} ₽</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.dish.id, item.quantity - 1)}
                  >
                    <Minus color="#9a4759" size={16} />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.dish.id, item.quantity + 1)}
                  >
                    <Plus color="#9a4759" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.dish.id)}
              >
                <Trash2 color="#ff4444" size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Рекомендации */}
        {getRecommendedDishes().length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Добавить ещё</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getRecommendedDishes().map(dish => (
                <TouchableOpacity
                  key={dish.id}
                  style={styles.recommendedDish}
                  onPress={() => addToCart(dish)}
                >
                  <Image source={{ uri: dish.image }} style={styles.recommendedImage} />
                  <Text style={styles.recommendedName} numberOfLines={2}>{dish.name}</Text>
                  <Text style={styles.recommendedPrice}>{dish.price} ₽</Text>
                  <View style={styles.addRecommendedButton}>
                    <Plus color="#fff" size={16} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeOptions: {
    flexDirection: 'row',
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9a4759',
    marginRight: 8,
  },
  timeOptionActive: {
    backgroundColor: '#9a4759',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  timeOptionTextActive: {
    color: '#fff',
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
    padding: 8,
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
});