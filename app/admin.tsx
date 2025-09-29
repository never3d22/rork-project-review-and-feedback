import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES, MOCK_CATEGORIES } from '@/constants/dishes';
import { Dish, Order, Category } from '@/types/restaurant';

export default function AdminScreen() {
  const { dishes, addDish, updateDish, deleteDish, user, orders, updateOrderStatus, toggleDishVisibility, restaurant, updateRestaurant, categories, addCategory, updateCategory, deleteCategory } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'dishes' | 'orders' | 'categories' | 'settings'>('dishes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Form states
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: CATEGORIES[0],
    available: true,
    weight: '',
    ingredients: '',
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    order: 1,
  });
  
  const [restaurantForm, setRestaurantForm] = useState({
    name: restaurant.name,
    address: restaurant.address,
    phone: restaurant.phone,
    workingHours: restaurant.workingHours,
    deliveryTime: restaurant.deliveryTime,
  });

  const resetForm = () => {
    setDishForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: CATEGORIES[0],
      available: true,
      weight: '',
      ingredients: '',
    });
  };

  const handleAddDish = () => {
    if (!dishForm.name.trim() || !dishForm.price.trim()) {
      return;
    }
    
    const newDish = {
      name: dishForm.name,
      description: dishForm.description,
      price: parseFloat(dishForm.price),
      image: dishForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      category: dishForm.category,
      available: dishForm.available,
      weight: dishForm.weight || undefined,
      ingredients: dishForm.ingredients ? dishForm.ingredients.split(',').map(i => i.trim()).filter(i => i) : undefined,
    };
    
    addDish(newDish);
    resetForm();
    setShowAddModal(false);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      image: dish.image,
      category: dish.category,
      available: dish.available,
      weight: dish.weight || '',
      ingredients: dish.ingredients ? dish.ingredients.join(', ') : '',
    });
    setShowAddModal(true);
  };

  const handleUpdateDish = () => {
    if (!editingDish || !dishForm.name.trim() || !dishForm.price.trim()) {
      return;
    }
    
    const updates = {
      name: dishForm.name,
      description: dishForm.description,
      price: parseFloat(dishForm.price),
      image: dishForm.image,
      category: dishForm.category,
      available: dishForm.available,
      weight: dishForm.weight || undefined,
      ingredients: dishForm.ingredients ? dishForm.ingredients.split(',').map(i => i.trim()).filter(i => i) : undefined,
    };
    
    updateDish(editingDish.id, updates);
    resetForm();
    setEditingDish(null);
    setShowAddModal(false);
  };

  const handleViewOrder = (order: Order) => {
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
      case 'pending': return 'В обработке';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivered': return 'Доставлен';
      default: return status;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dishes':
        return (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Управление блюдами</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus color="#fff" size={20} />
                <Text style={styles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map(category => {
                const categoryDishes = dishes.filter(dish => dish.category === category);
                if (categoryDishes.length === 0) return null;
                
                return (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    {categoryDishes.map(dish => (
                      <View key={dish.id} style={styles.dishCard}>
                        <Image source={{ uri: dish.image }} style={styles.dishImage} />
                        <View style={styles.dishInfo}>
                          <Text style={styles.dishName}>{dish.name}</Text>
                          <Text style={styles.dishPrice}>{dish.price} ₽</Text>
                        </View>
                        <View style={styles.dishActions}>
                          <TouchableOpacity
                            style={styles.hideButton}
                            onPress={() => toggleDishVisibility(dish.id)}
                          >
                            {dish.available ? (
                              <EyeOff color="#ff9800" size={16} />
                            ) : (
                              <Eye color="#4CAF50" size={16} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditDish(dish)}
                          >
                            <Edit3 color="#2196F3" size={16} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteDish(dish.id)}
                          >
                            <Trash2 color="#ff4444" size={16} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );
        
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Управление заказами</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {orders.length > 0 ? (
                orders.map(order => (
                  <TouchableOpacity 
                    key={order.id} 
                    style={styles.orderCard}
                    onPress={() => handleViewOrder(order)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>Заказ #{order.id}</Text>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order);
                        }}
                      >
                        <Eye color="#9a4759" size={16} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </Text>
                    <Text style={styles.orderTotal}>{order.total} ₽</Text>
                    
                    <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.orderStatusText}>{getStatusText(order.status)}</Text>
                    </View>
                    
                    {order.status !== 'delivered' && (
                      <View style={styles.orderActions}>
                        {order.status === 'pending' && (
                          <TouchableOpacity
                            style={styles.statusButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'preparing');
                            }}
                          >
                            <Text style={styles.statusButtonText}>Принять</Text>
                          </TouchableOpacity>
                        )}
                        {order.status === 'preparing' && (
                          <TouchableOpacity
                            style={styles.statusButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'ready');
                            }}
                          >
                            <Text style={styles.statusButtonText}>Готов</Text>
                          </TouchableOpacity>
                        )}
                        {order.status === 'ready' && (
                          <TouchableOpacity
                            style={styles.statusButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'delivered');
                            }}
                          >
                            <Text style={styles.statusButtonText}>Выдан</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Нет заказов</Text>
              )}
            </ScrollView>
          </View>
        );
        
      case 'categories':
        return (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Управление категориями</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setCategoryForm({ name: '', order: categories.length + 1 });
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
              >
                <Plus color="#fff" size={20} />
                <Text style={styles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map(category => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryOrder}>Порядок: {category.order}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditingCategory(category);
                        setCategoryForm({ name: category.name, order: category.order });
                        setShowCategoryModal(true);
                      }}
                    >
                      <Edit3 color="#2196F3" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteCategory(category.id)}
                    >
                      <Trash2 color="#ff4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
        
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Настройки ресторана</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setRestaurantForm({
                    name: restaurant.name,
                    address: restaurant.address,
                    phone: restaurant.phone,
                    workingHours: restaurant.workingHours,
                    deliveryTime: restaurant.deliveryTime,
                  });
                  setShowSettingsModal(true);
                }}
              >
                <Edit3 color="#fff" size={20} />
                <Text style={styles.addButtonText}>Редактировать</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>Информация о ресторане</Text>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Название:</Text>
                <Text style={styles.settingsValue}>{restaurant.name}</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Адрес:</Text>
                <Text style={styles.settingsValue}>{restaurant.address}</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Телефон:</Text>
                <Text style={styles.settingsValue}>{restaurant.phone}</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Часы работы:</Text>
                <Text style={styles.settingsValue}>{restaurant.workingHours}</Text>
              </View>
              <View style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Время доставки:</Text>
                <Text style={styles.settingsValue}>{restaurant.deliveryTime}</Text>
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Доступ запрещен</Text>
          <Text style={styles.accessDeniedSubtext}>Только администраторы могут просматривать эту страницу</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#9a4759', '#b85a6e']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Админ панель</Text>
      </LinearGradient>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dishes' && styles.activeTab]}
          onPress={() => setActiveTab('dishes')}
        >
          <Text style={[styles.tabText, activeTab === 'dishes' && styles.activeTabText]}>Блюда</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Заказы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Категории</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Настройки</Text>
        </TouchableOpacity>
      </View>
      
      {renderTabContent()}
      
      {/* Add/Edit Dish Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingDish(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingDish(null);
                  resetForm();
                }}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Название блюда *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите название блюда"
                  value={dishForm.name}
                  onChangeText={(text) => setDishForm({ ...dishForm, name: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Описание</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80 }]}
                  placeholder="Введите описание блюда"
                  value={dishForm.description}
                  onChangeText={(text) => setDishForm({ ...dishForm, description: text })}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Цена *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите цену в рублях"
                  value={dishForm.price}
                  onChangeText={(text) => setDishForm({ ...dishForm, price: text })}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Вес/объем</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Например: 250г, 300мл"
                  value={dishForm.weight}
                  onChangeText={(text) => setDishForm({ ...dishForm, weight: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Состав</Text>
                <TextInput
                  style={[styles.input, { minHeight: 60 }]}
                  placeholder="Перечислите ингредиенты через запятую"
                  value={dishForm.ingredients}
                  onChangeText={(text) => setDishForm({ ...dishForm, ingredients: text })}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>URL изображения</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ссылка на изображение блюда"
                  value={dishForm.image}
                  onChangeText={(text) => setDishForm({ ...dishForm, image: text })}
                />
              </View>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Категория:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        dishForm.category === category && styles.categoryChipActive
                      ]}
                      onPress={() => setDishForm({ ...dishForm, category })}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        dishForm.category === category && styles.categoryChipTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Доступно для заказа</Text>
                <Switch
                  value={dishForm.available}
                  onValueChange={(value) => setDishForm({ ...dishForm, available: value })}
                  trackColor={{ false: '#e0e0e0', true: '#9a4759' }}
                  thumbColor={dishForm.available ? '#fff' : '#f4f3f4'}
                />
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingDish ? handleUpdateDish : handleAddDish}
            >
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>
                {editingDish ? 'Сохранить' : 'Добавить'}
              </Text>
            </TouchableOpacity>
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
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Заказ #{selectedOrder.id}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowOrderModal(false)}
                  >
                    <X color="#666" size={24} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.orderDetails}>
                  <Text style={styles.orderDetailTitle}>Состав заказа:</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={`${item.dish.id}-${index}`} style={styles.orderDetailItem}>
                      <Text style={styles.orderDetailName}>{item.dish.name}</Text>
                      <Text style={styles.orderDetailQuantity}>x{item.quantity}</Text>
                      <Text style={styles.orderDetailPrice}>{item.dish.price * item.quantity} ₽</Text>
                    </View>
                  ))}
                  
                  <View style={styles.orderDetailSummary}>
                    <Text style={styles.orderDetailTotal}>Итого: {selectedOrder.total} ₽</Text>
                    <Text style={styles.orderDetailInfo}>
                      Способ: {selectedOrder.deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка'}
                    </Text>
                    {selectedOrder.deliveryAddress && (
                      <Text style={styles.orderDetailInfo}>
                        Адрес: {selectedOrder.deliveryAddress}
                      </Text>
                    )}
                    {selectedOrder.comments && (
                      <Text style={styles.orderDetailInfo}>
                        Комментарий: {selectedOrder.comments}
                      </Text>
                    )}
                    <Text style={styles.orderDetailInfo}>
                      Приборы: {selectedOrder.utensils ? `Нужны (${selectedOrder.utensilsCount || 1} шт.)` : 'Не нужны'}
                    </Text>
                    {selectedOrder.deliveryTime && (
                      <Text style={styles.orderDetailInfo}>
                        Время: {selectedOrder.deliveryTime}
                      </Text>
                    )}
                    <Text style={styles.orderDetailInfo}>
                      Оплата: {selectedOrder.paymentMethod === 'card' ? 'Карта' : 
                               selectedOrder.paymentMethod === 'cash' ? 'Наличные' : 'Онлайн'}
                    </Text>
                    <Text style={styles.orderDetailInfo}>
                      Создан: {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                    </Text>
                  </View>
                  
                  {selectedOrder.status !== 'delivered' && (
                    <View style={styles.orderDetailActions}>
                      {selectedOrder.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.detailStatusButton}
                          onPress={() => {
                            updateOrderStatus(selectedOrder.id, 'preparing');
                            setShowOrderModal(false);
                          }}
                        >
                          <Text style={styles.detailStatusButtonText}>Принять заказ</Text>
                        </TouchableOpacity>
                      )}
                      {selectedOrder.status === 'preparing' && (
                        <TouchableOpacity
                          style={styles.detailStatusButton}
                          onPress={() => {
                            updateOrderStatus(selectedOrder.id, 'ready');
                            setShowOrderModal(false);
                          }}
                        >
                          <Text style={styles.detailStatusButtonText}>Заказ готов</Text>
                        </TouchableOpacity>
                      )}
                      {selectedOrder.status === 'ready' && (
                        <TouchableOpacity
                          style={styles.detailStatusButton}
                          onPress={() => {
                            updateOrderStatus(selectedOrder.id, 'delivered');
                            setShowOrderModal(false);
                          }}
                        >
                          <Text style={styles.detailStatusButtonText}>Заказ выдан</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Название категории"
                value={categoryForm.name}
                onChangeText={(text) => setCategoryForm({ ...categoryForm, name: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Порядок сортировки"
                value={categoryForm.order.toString()}
                onChangeText={(text) => setCategoryForm({ ...categoryForm, order: parseInt(text) || 1 })}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (editingCategory) {
                  updateCategory(editingCategory.id, categoryForm);
                } else {
                  addCategory(categoryForm);
                }
                setShowCategoryModal(false);
                setEditingCategory(null);
              }}
            >
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>
                {editingCategory ? 'Сохранить' : 'Добавить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Restaurant Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Настройки ресторана</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettingsModal(false)}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Название ресторана *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите название ресторана"
                  value={restaurantForm.name}
                  onChangeText={(text) => setRestaurantForm({ ...restaurantForm, name: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Адрес *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите адрес ресторана"
                  value={restaurantForm.address}
                  onChangeText={(text) => setRestaurantForm({ ...restaurantForm, address: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Телефон *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите номер телефона"
                  value={restaurantForm.phone}
                  onChangeText={(text) => setRestaurantForm({ ...restaurantForm, phone: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Часы работы *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Например: 10:00 - 22:00"
                  value={restaurantForm.workingHours}
                  onChangeText={(text) => setRestaurantForm({ ...restaurantForm, workingHours: text })}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Время доставки *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Например: 30-45 мин"
                  value={restaurantForm.deliveryTime}
                  onChangeText={(text) => setRestaurantForm({ ...restaurantForm, deliveryTime: text })}
                />
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                updateRestaurant(restaurantForm);
                setShowSettingsModal(false);
              }}
            >
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>Сохранить</Text>
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
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#9a4759',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  activeTabText: {
    color: '#9a4759',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9a4759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 12,
  },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: '#9a4759',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  dishActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hideButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
  viewButton: {
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
  orderActions: {
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
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  categoryOrder: {
    fontSize: 14,
    color: '#666',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    flex: 1,
  },
  settingsValue: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginTop: 40,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#ff4444',
    marginBottom: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
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
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
    maxHeight: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#9a4759',
    borderColor: '#9a4759',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9a4759',
    margin: 20,
    padding: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  orderDetails: {
    padding: 20,
    maxHeight: 400,
  },
  orderDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 12,
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderDetailName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderDetailQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  orderDetailPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9a4759',
  },
  orderDetailSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  orderDetailTotal: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#9a4759',
    marginBottom: 8,
  },
  orderDetailInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  orderDetailActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailStatusButton: {
    backgroundColor: '#9a4759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailStatusButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});