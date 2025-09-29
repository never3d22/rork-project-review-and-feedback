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
import { Minus, Plus, Trash2, ShoppingBag, Utensils, Truck, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, dishes, addToCart, restaurant } = useRestaurant();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [utensilsCount, setUtensilsCount] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const insets = useSafeAreaInsets();

  const getRecommendedDishes = () => {
    const cartDishIds = cart.map(item => item.dish.id);
    return dishes.filter(dish => 
      dish.available && 
      !cartDishIds.includes(dish.id) &&
      dish.price <= 500
    ).slice(0, 3);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setShowEmptyModal(true);
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    const recommendedDishes = getRecommendedDishes();
    
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Корзина</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <ShoppingBag color="#ccc" size={80} />
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptySubtitle}>Добавьте блюда из меню</Text>
          
          {recommendedDishes.length > 0 && (
            <View style={styles.recommendedSection}>
              <Text style={styles.recommendedTitle}>Рекомендуем попробовать</Text>
              {recommendedDishes.map(dish => (
                <View key={dish.id} style={styles.recommendedCard}>
                  <Image source={{ uri: dish.image }} style={styles.recommendedImage} />
                  <View style={styles.recommendedInfo}>
                    <Text style={styles.recommendedName}>{dish.name}</Text>
                    <Text style={styles.recommendedPrice}>{dish.price} ₽</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.recommendedAddButton}
                    onPress={() => addToCart(dish)}
                  >
                    <Plus color="#fff" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
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
                  <Minus color="#FF6B6B" size={16} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.dish.id, item.quantity + 1)}
                >
                  <Plus color="#FF6B6B" size={16} />
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

        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Способ получения</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === 'pickup' && styles.deliveryOptionActive
              ]}
              onPress={() => setDeliveryType('pickup')}
            >
              <MapPin color={deliveryType === 'pickup' ? '#fff' : '#FF6B6B'} size={20} />
              <Text style={[
                styles.deliveryOptionText,
                deliveryType === 'pickup' && styles.deliveryOptionTextActive
              ]}>Самовывоз</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === 'delivery' && styles.deliveryOptionActive
              ]}
              onPress={() => setDeliveryType('delivery')}
            >
              <Truck color={deliveryType === 'delivery' ? '#fff' : '#FF6B6B'} size={20} />
              <Text style={[
                styles.deliveryOptionText,
                deliveryType === 'delivery' && styles.deliveryOptionTextActive
              ]}>Доставка</Text>
            </TouchableOpacity>
          </View>
          
          {deliveryType === 'delivery' && (
            <TextInput
              style={styles.addressInput}
              placeholder="Введите адрес доставки"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />
          )}
        </View>

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
              <Minus color="#FF6B6B" size={16} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{utensilsCount}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setUtensilsCount(utensilsCount + 1)}
            >
              <Plus color="#FF6B6B" size={16} />
            </TouchableOpacity>
          </View>
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
        visible={showEmptyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmptyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Корзина пуста</Text>
            <Text style={styles.modalText}>Добавьте блюда в корзину перед оформлением заказа</Text>
            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={() => setShowEmptyModal(false)}
            >
              <Text style={styles.modalButtonConfirmText}>Понятно</Text>
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
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
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
    color: '#FF6B6B',
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
  deliverySection: {
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
  deliveryOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  deliveryOptionActive: {
    backgroundColor: '#FF6B6B',
  },
  deliveryOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF6B6B',
  },
  deliveryOptionTextActive: {
    color: '#fff',
  },
  addressInput: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top' as const,
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
    color: '#FF6B6B',
  },
  checkoutButton: {
    backgroundColor: '#FF6B6B',
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
  recommendedSection: {
    width: '100%',
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  recommendedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  recommendedPrice: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600' as const,
  },
  recommendedAddButton: {
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});