import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Crown, 
  LogOut,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';

export default function ProfileScreen() {
  const { user, orders, loginAsAdmin, loginAsUser, logout, updateUser, updateOrderStatus } = useRestaurant();
  const insets = useSafeAreaInsets();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleLogin = () => {
    if (!userPhone.trim() || !userPassword.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const success = loginAsUser(userPhone, userPassword);
    if (success) {
      setShowUserModal(false);
      setUserPhone('');
      setUserPassword('');
    } else {
      Alert.alert('Ошибка', 'Неверные данные');
    }
  };
  
  const handleAdminLogin = () => {
    if (!adminUsername.trim() || !adminPassword.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const success = loginAsAdmin(adminUsername, adminPassword);
    if (success) {
      setShowAdminModal(false);
      setAdminUsername('');
      setAdminPassword('');
    } else {
      Alert.alert('Ошибка', 'Неверные данные для входа');
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      Alert.alert('Ошибка', 'Введите адрес');
      return;
    }
    const currentAddresses = user?.addresses || [];
    updateUser({ addresses: [...currentAddresses, newAddress] });
    setNewAddress('');
    setShowAddressModal(false);
  };

  const handleRemoveAddress = (index: number) => {
    const currentAddresses = user?.addresses || [];
    const updatedAddresses = currentAddresses.filter((_, i) => i !== index);
    updateUser({ addresses: updatedAddresses });
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#2196F3';
      case 'ready': return '#4CAF50';
      case 'delivered': return '#8BC34A';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivered': return 'Доставлен';
      default: return status;
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#9a4759', '#b85a6e']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Профиль</Text>
        </LinearGradient>

        <View style={styles.loginContainer}>
          <User color="#ccc" size={80} />
          <Text style={styles.loginTitle}>Добро пожаловать!</Text>
          <Text style={styles.loginSubtitle}>Войдите в свой аккаунт</Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowUserModal(true)}
          >
            <Text style={styles.loginButtonText}>Войти как клиент</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => setShowAdminModal(true)}
          >
            <Crown color="#FFD700" size={20} />
            <Text style={styles.adminButtonText}>Войти как админ</Text>
          </TouchableOpacity>
        </View>

        {/* User Login Modal */}
        <Modal
          visible={showUserModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUserModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Вход в аккаунт</Text>
              
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
                  onPress={() => setShowUserModal(false)}
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

        {/* Admin Login Modal */}
        <Modal
          visible={showAdminModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAdminModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Вход администратора</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Логин"
                value={adminUsername}
                onChangeText={setAdminUsername}
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowAdminModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={handleAdminLogin}
                >
                  <Text style={styles.modalButtonConfirmText}>Войти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user.isAdmin ? (
                <Crown color="#FFD700" size={24} />
              ) : (
                <User color="#fff" size={24} />
              )}
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.isAdmin && (
                <Text style={styles.adminBadge}>Администратор</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user.isAdmin && (
          <TouchableOpacity
            style={styles.adminPanel}
            onPress={() => router.push('/admin' as any)}
          >
            <Settings color="#9a4759" size={24} />
            <Text style={styles.adminPanelText}>Админ панель</Text>
          </TouchableOpacity>
        )}

        {!user.isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color="#333" size={20} />
              <Text style={styles.sectionTitle}>Мои адреса</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddressModal(true)}
              >
                <Plus color="#9a4759" size={20} />
              </TouchableOpacity>
            </View>
            
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((address, index) => (
                <View key={index} style={styles.addressCard}>
                  <Text style={styles.addressText}>{address}</Text>
                  <TouchableOpacity
                    style={styles.removeAddressButton}
                    onPress={() => handleRemoveAddress(index)}
                  >
                    <Trash2 color="#ff4444" size={16} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Нет сохраненных адресов</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag color="#333" size={20} />
            <Text style={styles.sectionTitle}>
              {user.isAdmin ? 'Все заказы' : 'Мои заказы'}
            </Text>
          </View>
          
          {orders.length > 0 ? (
            orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Заказ #{order.id}</Text>
                  <TouchableOpacity
                    style={styles.viewOrderButton}
                    onPress={() => handleViewOrder(order)}
                  >
                    <Eye color="#9a4759" size={16} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </Text>
                <Text style={styles.orderTotal}>{order.total} ₽</Text>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderStatusText}>{getStatusText(order.status)}</Text>
                </View>
                
                {user.isAdmin && order.status !== 'delivered' && (
                  <View style={styles.adminControls}>
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        <Text style={styles.statusButtonText}>Принять</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'preparing' && (
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => updateOrderStatus(order.id, 'ready')}
                      >
                        <Text style={styles.statusButtonText}>Готов</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'ready' && (
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        <Text style={styles.statusButtonText}>Выдан</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Нет заказов</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить адрес</Text>
            
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Введите адрес"
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleAddAddress}
              >
                <Text style={styles.modalButtonConfirmText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Заказ #{selectedOrder.id}</Text>
                
                <ScrollView style={styles.orderDetails}>
                  {selectedOrder.items.map((item: any, index: number) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.orderItemName}>{item.dish.name}</Text>
                      <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                      <Text style={styles.orderItemPrice}>{item.dish.price * item.quantity} ₽</Text>
                    </View>
                  ))}
                  
                  <View style={styles.orderSummary}>
                    <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                      <Text style={styles.orderStatusBadgeText}>{getStatusText(selectedOrder.status)}</Text>
                    </View>
                    
                    <Text style={styles.orderSummaryText}>Итого: {selectedOrder.total} ₽</Text>
                    <Text style={styles.orderSummaryText}>
                      Способ: {selectedOrder.deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка'}
                    </Text>
                    {selectedOrder.deliveryAddress && (
                      <Text style={styles.orderSummaryText}>
                        Адрес: {selectedOrder.deliveryAddress}
                      </Text>
                    )}
                    {selectedOrder.deliveryTime && (
                      <Text style={styles.orderSummaryText}>
                        Время: {selectedOrder.deliveryTime}
                      </Text>
                    )}
                    {selectedOrder.paymentMethod && (
                      <Text style={styles.orderSummaryText}>
                        Оплата: {selectedOrder.paymentMethod === 'card' ? 'Банковская карта' : selectedOrder.paymentMethod === 'cash' ? 'Наличные' : 'Онлайн оплата'}
                      </Text>
                    )}
                    {selectedOrder.utensilsCount !== undefined && (
                      <Text style={styles.orderSummaryText}>
                        Приборы: {selectedOrder.utensilsCount} шт.
                      </Text>
                    )}
                    {selectedOrder.comments && (
                      <Text style={styles.orderSummaryText}>
                        Комментарий: {selectedOrder.comments}
                      </Text>
                    )}
                    <Text style={styles.orderSummaryText}>
                      Создан: {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                    </Text>
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={() => setShowOrderModal(false)}
                >
                  <Text style={styles.modalButtonConfirmText}>Закрыть</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выход</Text>
            <Text style={styles.modalText}>Вы уверены, что хотите выйти?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  logout();
                  setShowLogoutModal(false);
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Выйти</Text>
              </TouchableOpacity>
            </View>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  adminBadge: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center' as const,
  },
  loginButton: {
    backgroundColor: '#9a4759',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 16,
    padding: 18,
    width: '100%',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  adminPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adminPanelText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeAddressButton: {
    padding: 4,
  },
  orderCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  viewOrderButton: {
    padding: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#9a4759',
    marginBottom: 8,
  },
  orderStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  adminControls: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#9a4759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
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
  orderDetails: {
    maxHeight: 300,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9a4759',
  },
  orderSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  orderSummaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  orderStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  orderStatusBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
});