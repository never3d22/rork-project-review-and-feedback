import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Crown, 
  LogOut,
  MapPin,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  X,
  Store,
  ChevronUp,
  ChevronDown,
  Edit,
  Calendar,
  Mail,
  Navigation,
} from 'lucide-react-native';

import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES } from '@/constants/dishes';
import { Dish } from '@/types/restaurant';

export default function ProfileScreen() {
  const { user, orders, loginAsAdmin, logout, updateUser, updateOrderStatus, cancelOrder, sendSMSCode, verifySMSCode, dishes, addDish, updateDish, deleteDish, toggleDishVisibility, categories, addCategory, deleteCategory, reorderCategories, toggleCategoryVisibility, restaurant, updateRestaurant } = useRestaurant();
  const insets = useSafeAreaInsets();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDishManagementModal, setShowDishManagementModal] = useState(false);
  const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showEditDishModal, setShowEditDishModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showRestaurantSettingsModal, setShowRestaurantSettingsModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [newDishDescription, setNewDishDescription] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Салаты');
  const [newDishImage, setNewDishImage] = useState('');
  const [newDishWeight, setNewDishWeight] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantWorkingHours, setRestaurantWorkingHours] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0 && showVerifyModal) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showVerifyModal]);

  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    
    if (limited.length === 0) return '';
    if (limited.length <= 1) return `+7 (${limited}`;
    if (limited.length <= 4) return `+7 (${limited.slice(1)}`;
    if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
    return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9)}`;
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) return phone;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  };

  const getCleanPhoneNumber = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };

  const handleSendCode = async () => {
    const cleanPhone = getCleanPhoneNumber(authPhone);
    
    if (cleanPhone.length !== 11) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await sendSMSCode(cleanPhone);
      
      if (success) {
        setShowPhoneModal(false);
        setShowVerifyModal(true);
        setTimeLeft(60);
        setErrorMessage('');
      } else {
        setErrorMessage('Не удалось отправить код. Попробуйте еще раз.');
      }
    } catch {
      setErrorMessage('Произошла ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = verificationCode.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('Ошибка', 'Введите полный код из 6 цифр');
      return;
    }

    const cleanPhone = getCleanPhoneNumber(authPhone);
    setIsLoading(true);
    
    try {
      const success = await verifySMSCode(cleanPhone, fullCode);
      
      if (success) {
        setShowVerifyModal(false);
        setAuthPhone('');
        setVerificationCode(['', '', '', '', '', '']);
        setErrorMessage('');
      } else {
        setErrorMessage('Неправильный код. Попробуйте еще раз.');
        setVerificationCode(['', '', '', '', '', '']);
        setTimeout(() => {
          codeInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch {
      setErrorMessage('Произошла ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6);
      const newCode = [...verificationCode];
      
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      
      setVerificationCode(newCode);
      
      const nextIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        codeInputRefs.current[nextIndex]?.focus();
      }, 10);
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = text.replace(/\D/g, '');
    setVerificationCode(newCode);
    
    if (text && index < 5) {
      setTimeout(() => {
        codeInputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      setTimeout(() => {
        codeInputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  const handleCodeFocus = (index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = '';
    setVerificationCode(newCode);
  };

  const handleResendCode = async () => {
    const cleanPhone = getCleanPhoneNumber(authPhone);
    
    try {
      await sendSMSCode(cleanPhone);
      setTimeLeft(60);
      setErrorMessage('Код отправлен повторно');
    } catch {
      setErrorMessage('Не удалось отправить код повторно');
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

  const handleGetLocation = async () => {
    if (Platform.OS === 'web') {
      setIsLoadingLocation(true);
      try {
        if (!navigator.geolocation) {
          Alert.alert('Ошибка', 'Геолокация не поддерживается вашим браузером');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
              );
              const data = await response.json();
              const address = data.display_name || `${latitude}, ${longitude}`;
              setNewAddress(address);
            } catch (error) {
              console.error('Ошибка получения адреса:', error);
              setNewAddress(`${latitude}, ${longitude}`);
            } finally {
              setIsLoadingLocation(false);
            }
          },
          (error) => {
            console.error('Ошибка геолокации:', error);
            Alert.alert('Ошибка', 'Не удалось получить местоположение');
            setIsLoadingLocation(false);
          }
        );
      } catch (error) {
        console.error('Ошибка:', error);
        Alert.alert('Ошибка', 'Не удалось получить местоположение');
        setIsLoadingLocation(false);
      }
    } else {
      setIsLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Ошибка', 'Разрешение на доступ к местоположению отклонено');
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          const address = [
            addr.street,
            addr.streetNumber,
            addr.city,
            addr.region,
            addr.country,
          ]
            .filter(Boolean)
            .join(', ');
          setNewAddress(address || `${latitude}, ${longitude}`);
        } else {
          setNewAddress(`${latitude}, ${longitude}`);
        }
      } catch (error) {
        console.error('Ошибка получения местоположения:', error);
        Alert.alert('Ошибка', 'Не удалось получить местоположение');
      } finally {
        setIsLoadingLocation(false);
      }
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }
    updateUser({
      name: editName,
      email: editEmail,
      birthday: editBirthday,
    });
    setShowEditProfileModal(false);
    Alert.alert('Успех', 'Профиль обновлен');
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
      case 'cancelled': return '#ff4444';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'В обработке';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
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
            onPress={() => setShowPhoneModal(true)}
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

        <Modal
          visible={showPhoneModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPhoneModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Вход в аккаунт</Text>
              <Text style={styles.modalSubtitle}>Введите номер телефона для получения SMS-кода</Text>
              
              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}
              
              <TextInput
                style={styles.input}
                placeholder="+7 (999) 123-45-67"
                value={authPhone}
                onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowPhoneModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonConfirm,
                    (!authPhone || isLoading) && styles.modalButtonDisabled
                  ]}
                  onPress={handleSendCode}
                  disabled={!authPhone || isLoading}
                >
                  <Text style={[
                    styles.modalButtonConfirmText,
                    (!authPhone || isLoading) && styles.modalButtonTextDisabled
                  ]}>
                    {isLoading ? 'Отправляем...' : 'Получить код'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showVerifyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVerifyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Подтверждение номера</Text>
              <Text style={styles.modalSubtitle}>
                Введите код из SMS, отправленный на номер {authPhone}
              </Text>
              
              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}
              
              <View style={styles.codeContainer}>
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      codeInputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                    onFocus={() => handleCodeFocus(index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    selectTextOnFocus
                    autoFocus={index === 0}
                    testID={`code-input-${index}`}
                  />
                ))}
              </View>
              
              <View style={styles.resendContainer}>
                {timeLeft > 0 ? (
                  <Text style={styles.timerText}>
                    Повторная отправка через {timeLeft} сек
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendCode}>
                    <Text style={styles.resendText}>
                      Отправить код повторно
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setShowVerifyModal(false);
                    setShowPhoneModal(true);
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Назад</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonConfirm,
                    (verificationCode.join('').length !== 6 || isLoading) && styles.modalButtonDisabled
                  ]}
                  onPress={handleVerifyCode}
                  disabled={verificationCode.join('').length !== 6 || isLoading}
                >
                  <Text style={[
                    styles.modalButtonConfirmText,
                    (verificationCode.join('').length !== 6 || isLoading) && styles.modalButtonTextDisabled
                  ]}>
                    {isLoading ? 'Проверяем...' : 'Подтвердить'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
        {!user.isAdmin && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User color="#333" size={20} />
                <Text style={styles.sectionTitle}>Личная информация</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setEditName(user.name);
                    setEditEmail(user.email || '');
                    setEditBirthday(user.birthday || '');
                    setShowEditProfileModal(true);
                  }}
                >
                  <Edit color="#9a4759" size={20} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <User color="#666" size={16} />
                  <Text style={styles.infoLabel}>Имя:</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.phoneIcon}>📱</Text>
                  <Text style={styles.infoLabel}>Телефон:</Text>
                  <Text style={styles.infoValue}>{formatPhoneDisplay(user.phone || '')}</Text>
                </View>
                {user.email && (
                  <View style={styles.infoRow}>
                    <Mail color="#666" size={16} />
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                )}
                {user.birthday && (
                  <View style={styles.infoRow}>
                    <Calendar color="#666" size={16} />
                    <Text style={styles.infoLabel}>Дата рождения:</Text>
                    <Text style={styles.infoValue}>{user.birthday}</Text>
                  </View>
                )}
              </View>
            </View>

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
          </>
        )}

        {user.isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings color="#333" size={20} />
              <Text style={styles.sectionTitle}>Управление рестораном</Text>
            </View>
            
            <TouchableOpacity
              style={styles.adminFunctionCard}
              onPress={() => setShowDishManagementModal(true)}
              activeOpacity={0.9}
            >
              <View style={styles.adminFunctionIcon}>
                <Settings color="#9a4759" size={24} />
              </View>
              <View style={styles.adminFunctionInfo}>
                <Text style={styles.adminFunctionTitle}>Управление блюдами</Text>
                <Text style={styles.adminFunctionDescription}>Добавление и редактирование блюд</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.adminFunctionCard}
              onPress={() => setShowCategoryManagementModal(true)}
              activeOpacity={0.9}
            >
              <View style={styles.adminFunctionIcon}>
                <Settings color="#9a4759" size={24} />
              </View>
              <View style={styles.adminFunctionInfo}>
                <Text style={styles.adminFunctionTitle}>Управление категориями</Text>
                <Text style={styles.adminFunctionDescription}>Добавление и редактирование категорий</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.adminFunctionCard}
              onPress={() => {
                setRestaurantName(restaurant.name);
                setRestaurantAddress(restaurant.address);
                setRestaurantPhone(restaurant.phone);
                setRestaurantWorkingHours(restaurant.workingHours);
                setRestaurantLogo(restaurant.logo || '');
                setShowRestaurantSettingsModal(true);
              }}
              activeOpacity={0.9}
            >
              <View style={styles.adminFunctionIcon}>
                <Store color="#9a4759" size={24} />
              </View>
              <View style={styles.adminFunctionInfo}>
                <Text style={styles.adminFunctionTitle}>Настройки ресторана</Text>
                <Text style={styles.adminFunctionDescription}>Информация о ресторане</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}


      </ScrollView>

      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать профиль</Text>
            
            <Text style={styles.fieldLabel}>Имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите имя"
              value={editName}
              onChangeText={setEditName}
            />
            
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите email"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.fieldLabel}>Дата рождения</Text>
            <TextInput
              style={styles.input}
              placeholder="ДД.ММ.ГГГГ"
              value={editBirthday}
              onChangeText={setEditBirthday}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonConfirmText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить адрес</Text>
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={isLoadingLocation}
            >
              <Navigation color="#fff" size={18} />
              <Text style={styles.locationButtonText}>
                {isLoadingLocation ? 'Определяем местоположение...' : 'Определить автоматически'}
              </Text>
            </TouchableOpacity>
            
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
                    
                    {selectedOrder.status === 'cancelled' && (
                      <View style={styles.cancelledOrderInfo}>
                        <Text style={styles.cancelledOrderTitle}>Заказ отменен</Text>
                        {selectedOrder.cancelReason && (
                          <Text style={styles.cancelledOrderReason}>Причина: {selectedOrder.cancelReason}</Text>
                        )}
                        {selectedOrder.cancelledAt && (
                          <Text style={styles.cancelledOrderDate}>
                            Отменен: {new Date(selectedOrder.cancelledAt).toLocaleString('ru-RU')}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </ScrollView>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButtonConfirm, { flex: 1 }]}
                    onPress={() => setShowOrderModal(false)}
                  >
                    <Text style={styles.modalButtonConfirmText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDishManagementModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDishManagementModal(false)}
      >
        <View style={styles.managementModalContainer}>
          <View style={styles.managementModalHeader}>
            <Text style={styles.managementModalTitle}>Управление блюдами</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDishManagementModal(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              setNewDishName('');
              setNewDishDescription('');
              setNewDishPrice('');
              setNewDishCategory('Салаты');
              setNewDishImage('');
              setNewDishWeight('');
              setShowAddDishModal(true);
            }}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addNewButtonText}>Добавить блюдо</Text>
          </TouchableOpacity>
          
          <ScrollView style={styles.managementModalContent}>
            {dishes.map(dish => (
              <View key={dish.id} style={styles.managementItem}>
                <Image source={{ uri: dish.image }} style={styles.dishThumbnail} />
                <View style={styles.managementItemInfo}>
                  <Text style={styles.managementItemName}>{dish.name}</Text>
                  <Text style={styles.managementItemDetails}>{dish.category} • {dish.price} ₽</Text>
                </View>
                <View style={styles.managementItemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => toggleDishVisibility(dish.id)}
                  >
                    {dish.available ? (
                      <Eye color="#fff" size={16} />
                    ) : (
                      <EyeOff color="#fff" size={16} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      setEditingDish(dish);
                      setNewDishName(dish.name);
                      setNewDishDescription(dish.description);
                      setNewDishPrice(dish.price.toString());
                      setNewDishCategory(dish.category);
                      setNewDishImage(dish.image);
                      setNewDishWeight(dish.weight || '');
                      setShowEditDishModal(true);
                    }}
                  >
                    <Settings color="#fff" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      Alert.alert(
                        'Удалить блюдо',
                        `Вы уверены, что хотите удалить "${dish.name}"?`,
                        [
                          { text: 'Отмена', style: 'cancel' },
                          { text: 'Удалить', onPress: () => deleteDish(dish.id), style: 'destructive' }
                        ]
                      );
                    }}
                  >
                    <Trash2 color="#fff" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showCategoryManagementModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryManagementModal(false)}
      >
        <View style={styles.managementModalContainer}>
          <View style={styles.managementModalHeader}>
            <Text style={styles.managementModalTitle}>Управление категориями</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryManagementModal(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              setNewCategoryName('');
              setShowAddCategoryModal(true);
            }}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addNewButtonText}>Добавить категорию</Text>
          </TouchableOpacity>
          
          <ScrollView style={styles.managementModalContent}>
            {categories.map((category, index) => (
              <View key={category.id} style={styles.managementItem}>
                <View style={styles.dragHandleContainer}>
                  <TouchableOpacity
                    style={styles.dragHandleButton}
                    onPress={() => {
                      if (index > 0) {
                        const newCategories = [...categories];
                        [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
                        reorderCategories(newCategories);
                      }
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp color={index === 0 ? "#ccc" : "#666"} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dragHandleButton}
                    onPress={() => {
                      if (index < categories.length - 1) {
                        const newCategories = [...categories];
                        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
                        reorderCategories(newCategories);
                      }
                    }}
                    disabled={index === categories.length - 1}
                  >
                    <ChevronDown color={index === categories.length - 1 ? "#ccc" : "#666"} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={styles.managementItemInfo}>
                  <Text style={styles.managementItemName}>{category.name}</Text>
                </View>
                <View style={styles.managementItemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => toggleCategoryVisibility(category.id)}
                  >
                    {category.visible !== false ? (
                      <Eye color="#fff" size={16} />
                    ) : (
                      <EyeOff color="#fff" size={16} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      Alert.alert(
                        'Удалить категорию',
                        `Вы уверены, что хотите удалить "${category.name}"?`,
                        [
                          { text: 'Отмена', style: 'cancel' },
                          { text: 'Удалить', onPress: () => deleteCategory(category.id), style: 'destructive' }
                        ]
                      );
                    }}
                  >
                    <Trash2 color="#fff" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showAddDishModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить блюдо</Text>
            
            <ScrollView style={styles.formScroll}>
              <Text style={styles.fieldLabel}>Название</Text>
              <TextInput
                style={styles.input}
                placeholder="Название"
                value={newDishName}
                onChangeText={setNewDishName}
              />
              
              <Text style={styles.fieldLabel}>Описание</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Описание"
                value={newDishDescription}
                onChangeText={setNewDishDescription}
                multiline
                textAlignVertical="top"
              />
              
              <Text style={styles.fieldLabel}>Цена</Text>
              <TextInput
                style={styles.input}
                placeholder="Цена"
                value={newDishPrice}
                onChangeText={setNewDishPrice}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Вес</Text>
              <TextInput
                style={styles.input}
                placeholder="Вес (например: 250г)"
                value={newDishWeight}
                onChangeText={setNewDishWeight}
              />
              
              <Text style={styles.fieldLabel}>URL изображения</Text>
              <TextInput
                style={styles.input}
                placeholder="URL изображения"
                value={newDishImage}
                onChangeText={setNewDishImage}
              />
              
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Категория:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryPill,
                        newDishCategory === cat && styles.categoryPillActive
                      ]}
                      onPress={() => setNewDishCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryPillText,
                        newDishCategory === cat && styles.categoryPillTextActive
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddDishModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  if (!newDishName || !newDishPrice) {
                    Alert.alert('Ошибка', 'Заполните название и цену');
                    return;
                  }
                  addDish({
                    name: newDishName,
                    description: newDishDescription,
                    price: parseFloat(newDishPrice),
                    category: newDishCategory,
                    image: newDishImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                    available: true,
                    weight: newDishWeight,
                  });
                  setShowAddDishModal(false);
                  Alert.alert('Успех', 'Блюдо добавлено');
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditDishModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditDishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать блюдо</Text>
            
            <ScrollView style={styles.formScroll}>
              <Text style={styles.fieldLabel}>Название</Text>
              <TextInput
                style={styles.input}
                placeholder="Название"
                value={newDishName}
                onChangeText={setNewDishName}
              />
              
              <Text style={styles.fieldLabel}>Описание</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Описание"
                value={newDishDescription}
                onChangeText={setNewDishDescription}
                multiline
                textAlignVertical="top"
              />
              
              <Text style={styles.fieldLabel}>Цена</Text>
              <TextInput
                style={styles.input}
                placeholder="Цена"
                value={newDishPrice}
                onChangeText={setNewDishPrice}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Вес</Text>
              <TextInput
                style={styles.input}
                placeholder="Вес (например: 250г)"
                value={newDishWeight}
                onChangeText={setNewDishWeight}
              />
              
              <Text style={styles.fieldLabel}>URL изображения</Text>
              <TextInput
                style={styles.input}
                placeholder="URL изображения"
                value={newDishImage}
                onChangeText={setNewDishImage}
              />
              
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Категория:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryPill,
                        newDishCategory === cat && styles.categoryPillActive
                      ]}
                      onPress={() => setNewDishCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryPillText,
                        newDishCategory === cat && styles.categoryPillTextActive
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowEditDishModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  if (!editingDish || !newDishName || !newDishPrice) {
                    Alert.alert('Ошибка', 'Заполните название и цену');
                    return;
                  }
                  updateDish(editingDish.id, {
                    name: newDishName,
                    description: newDishDescription,
                    price: parseFloat(newDishPrice),
                    category: newDishCategory,
                    image: newDishImage,
                    weight: newDishWeight,
                  });
                  setShowEditDishModal(false);
                  Alert.alert('Успех', 'Блюдо обновлено');
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить категорию</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Название категории"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddCategoryModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  if (!newCategoryName.trim()) {
                    Alert.alert('Ошибка', 'Введите название категории');
                    return;
                  }
                  addCategory({
                    name: newCategoryName,
                    order: categories.length + 1,
                  });
                  setShowAddCategoryModal(false);
                  Alert.alert('Успех', 'Категория добавлена');
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRestaurantSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRestaurantSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Настройки ресторана</Text>
            
            <ScrollView style={styles.formScroll}>
              <Text style={styles.fieldLabel}>Название</Text>
              <TextInput
                style={styles.input}
                placeholder="Название ресторана"
                value={restaurantName}
                onChangeText={setRestaurantName}
              />
              
              <Text style={styles.fieldLabel}>Адрес</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={restaurantAddress}
                onChangeText={setRestaurantAddress}
              />
              
              <Text style={styles.fieldLabel}>Телефон</Text>
              <TextInput
                style={styles.input}
                placeholder="Телефон"
                value={restaurantPhone}
                onChangeText={setRestaurantPhone}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.fieldLabel}>Часы работы</Text>
              <TextInput
                style={styles.input}
                placeholder="Часы работы"
                value={restaurantWorkingHours}
                onChangeText={setRestaurantWorkingHours}
              />
              
              <Text style={styles.fieldLabel}>Логотип</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                  });

                  if (!result.canceled) {
                    setRestaurantLogo(result.assets[0].uri);
                  }
                }}
              >
                <Text style={styles.uploadButtonText}>Выбрать логотип из галереи</Text>
              </TouchableOpacity>
              {restaurantLogo ? (
                <View style={styles.logoPreviewContainer}>
                  <Image source={{ uri: restaurantLogo }} style={styles.logoPreview} />
                  <TouchableOpacity
                    style={styles.removeLogoButton}
                    onPress={() => setRestaurantLogo('')}
                  >
                    <Text style={styles.removeLogoText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowRestaurantSettingsModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  if (!restaurantName.trim()) {
                    Alert.alert('Ошибка', 'Введите название ресторана');
                    return;
                  }
                  updateRestaurant({
                    name: restaurantName,
                    address: restaurantAddress,
                    phone: restaurantPhone,
                    workingHours: restaurantWorkingHours,
                    logo: restaurantLogo,
                  });
                  setShowRestaurantSettingsModal(false);
                  Alert.alert('Успех', 'Настройки обновлены');
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    borderRadius: 20,
    padding: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  adminSection: {
    marginBottom: 20,
  },
  adminSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 12,
  },
  adminPanel: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#9a4759',
  },
  adminPanelText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  adminFunctionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  adminFunctionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#9a4759',
  },
  adminFunctionInfo: {
    flex: 1,
  },
  adminFunctionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  adminFunctionDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
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
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeAddressButton: {
    padding: 4,
  },
  ordersScrollView: {
    maxHeight: 500,
  },
  orderCard: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
    flex: 1,
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
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
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
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  codeInput: {
    width: 40,
    height: 48,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  codeInputFilled: {
    borderColor: '#9a4759',
    backgroundColor: '#f8f9fa',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#999',
  },
  resendText: {
    fontSize: 14,
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  modalButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  modalButtonTextDisabled: {
    color: '#999',
  },
  errorMessage: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center' as const,
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  cancelledInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  cancelledReason: {
    fontSize: 12,
    color: '#ff4444',
    fontStyle: 'italic' as const,
  },
  cancelledOrderInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  cancelledOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ff4444',
    marginBottom: 8,
  },
  cancelledOrderReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cancelledOrderDate: {
    fontSize: 14,
    color: '#666',
  },
  managementModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  managementModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  managementModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  managementModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addNewButton: {
    backgroundColor: '#9a4759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addNewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  managementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  managementItemInfo: {
    flex: 1,
  },
  managementItemName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  managementItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  managementItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9a4759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
  },
  formScroll: {
    maxHeight: 400,
    flexGrow: 0,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryPillActive: {
    backgroundColor: '#9a4759',
    borderColor: '#9a4759',
  },
  categoryPillText: {
    fontSize: 14,
    color: '#666',
  },
  categoryPillTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  dishThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover' as const,
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  dragHandleContainer: {
    flexDirection: 'column',
    marginRight: 8,
  },
  dragHandleButton: {
    padding: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#9a4759',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'contain' as const,
  },
  removeLogoButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeLogoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  phoneIcon: {
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: '#9a4759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
