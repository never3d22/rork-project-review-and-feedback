import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CreditCard, 
  Banknote, 
  Smartphone,
  MessageSquare,
  MapPin,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';

type PaymentMethod = 'card' | 'cash' | 'sberpay' | 'sbp';

export default function CheckoutScreen() {
  const { cart, getCartTotal, createOrder, user, addAddress } = useRestaurant();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const needUtensils = true;
  const [comments, setComments] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const paymentOptions = [
    { id: 'card' as PaymentMethod, title: 'Банковская карта', icon: CreditCard },
    { id: 'cash' as PaymentMethod, title: 'Наличные', icon: Banknote },
    { id: 'sberpay' as PaymentMethod, title: 'SberPay', icon: Smartphone },
    { id: 'sbp' as PaymentMethod, title: 'СБП', icon: CreditCard },
  ];

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called, cart length:', cart.length);
    
    if (cart.length === 0) {
      console.log('Cart is empty, showing error');
      setShowErrorModal(true);
      return;
    }

    if (!user) {
      console.log('User not authenticated, redirecting to auth');
      router.push('/auth/phone' as any);
      return;
    }

    try {
      console.log('\n🔵 [CHECKOUT] Creating order...');
      console.log('Payment method selected:', paymentMethod);
      console.log('Payment method type:', typeof paymentMethod);
      console.log('Cart items:', cart.length);
      console.log('Total:', getCartTotal());
      
      if (deliveryAddress && deliveryAddress.trim()) {
        addAddress(deliveryAddress.trim());
      }
      
      const orderData = {
        items: cart,
        total: getCartTotal(),
        utensils: needUtensils,
        utensilsCount: needUtensils ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0,
        paymentMethod,
        deliveryType: 'pickup' as const,
        comments,
        deliveryAddress: deliveryAddress || undefined,
      };
      
      console.log('\n🔵 [CHECKOUT] Order data prepared:', JSON.stringify({
        itemsCount: orderData.items.length,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryType: orderData.deliveryType,
        utensils: orderData.utensils,
        utensilsCount: orderData.utensilsCount,
        comments: orderData.comments,
      }, null, 2));
      
      const newOrderId = await createOrder(orderData);
      
      console.log('\n✅ [CHECKOUT] Order created successfully, ID:', newOrderId);
      setOrderId(newOrderId);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        setErrorMessage('Проблема с подключением к серверу. Заказ сохранен локально и будет обработан позже.');
      } else {
        setErrorMessage('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      }
      
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          {cart.map(item => (
            <View key={item.dish.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.dish.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{item.dish.price * item.quantity} ₽</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalAmount}>{getCartTotal()} ₽</Text>
          </View>
        </View>

        <View style={styles.section}>
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
                  color={paymentMethod === option.id ? '#fff' : '#9a4759'} 
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



        <View style={styles.section}>
          <View style={styles.commentHeader}>
            <MapPin color="#333" size={20} />
            <Text style={styles.sectionTitle}>Адрес доставки</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Введите адрес доставки (необязательно)"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.commentHeader}>
            <MessageSquare color="#333" size={20} />
            <Text style={styles.sectionTitle}>Комментарий к заказу</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Дополнительные пожелания..."
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={['#9a4759', '#b85a6e']}
          style={styles.placeOrderButton}
        >
          <TouchableOpacity
            style={styles.placeOrderButtonInner}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderButtonText}>
              Оформить заказ на {getCartTotal()} ₽
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Заказ оформлен!</Text>
            <Text style={styles.modalText}>
              Ваш заказ #{orderId} принят в обработку.
              Мы свяжемся с вами для подтверждения.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.modalButtonText}>Отлично!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Внимание</Text>
            <Text style={styles.modalText}>
              {errorMessage || 'Произошла ошибка при оформлении заказа. Попробуйте еще раз.'}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9a4759',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#9a4759',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    gap: 16,
  },
  paymentOptionActive: {
    backgroundColor: '#9a4759',
    borderColor: '#9a4759',
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    flex: 1,
  },
  paymentOptionTextActive: {
    color: '#fff',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  radioButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  placeOrderButton: {
    borderRadius: 16,
  },
  placeOrderButtonInner: {
    padding: 18,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#9a4759',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});