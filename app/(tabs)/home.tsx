import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Minus, Clock, MapPin, Eye, EyeOff, X, ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES } from '@/constants/dishes';
import { Dish } from '@/types/restaurant';

export default function MenuScreen() {
  const { dishes, addToCart, updateQuantity, cart, restaurant, user, toggleDishVisibility, orders, categories } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showDishModal, setShowDishModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 60],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const handleDishPress = (dish: Dish) => {
    setSelectedDish(dish);
    setShowDishModal(true);
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish);
  };

  const getModalDishQuantity = () => {
    if (!selectedDish) return 0;
    const cartItem = cart.find(item => item.dish.id === selectedDish.id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleGoToCart = () => {
    setShowDishModal(false);
    router.push('/(tabs)/cart');
  };

  // Get user's current active order
  const currentOrder = user && !user.isAdmin ? orders.find(order => order.status !== 'delivered') : null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#2196F3';
      case 'ready': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'В обработке';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      default: return status;
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 100) {
        router.push('/(tabs)/profile');
      } else if (gestureState.dx < -100) {
        router.push('/(tabs)/cart');
      }
    },
  });

  const renderDishCard = (item: Dish) => {
    const cartItem = cart.find(cartItem => cartItem.dish.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[styles.dishCard, !item.available && styles.dishCardUnavailable]}
        onPress={() => item.available ? handleDishPress(item) : null}
        activeOpacity={item.available ? 0.9 : 1}
        disabled={!item.available}
      >
        <Image source={{ uri: item.image }} style={[styles.dishImage, !item.available && styles.dishImageUnavailable]} />
        <View style={styles.dishInfo}>
          <Text style={[styles.dishName, !item.available && styles.dishNameUnavailable]}>{item.name}</Text>
          <Text style={[styles.dishDescription, !item.available && styles.dishDescriptionUnavailable]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.dishPriceRow}>
            <Text style={[styles.dishWeight, !item.available && styles.dishWeightUnavailable]}>
              {item.weight || '100г'}
            </Text>
            <Text style={[styles.dishPrice, !item.available && styles.dishPriceUnavailable]}>{item.price} ₽</Text>
          </View>
          
          <View style={styles.dishActionsRow}>
            {user?.isAdmin && (
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleDishVisibility(item.id);
                }}
              >
                {item.available ? (
                  <Eye color="#9a4759" size={20} />
                ) : (
                  <EyeOff color="#999" size={20} />
                )}
              </TouchableOpacity>
            )}
            
            {item.available && (
              <View style={styles.dishButtonContainer}>
                {quantity > 0 ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, quantity - 1);
                      }}
                      activeOpacity={0.8}
                    >
                      <Minus color="#fff" size={14} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, quantity + 1);
                      }}
                      activeOpacity={0.8}
                    >
                      <Plus color="#fff" size={14} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    activeOpacity={0.8}
                  >
                    <Plus color="#fff" size={16} />
                    <Text style={styles.addButtonText}>Добавить</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <LinearGradient
          colors={['#9a4759', '#b85a6e']}
          style={styles.header}
        >
          <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.restaurantInfo}>
              <View style={styles.infoItem}>
                <MapPin color="#fff" size={16} />
                <Text style={styles.infoText}>{restaurant.address}</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock color="#fff" size={16} />
                <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Order Status Block for Users */}
      {currentOrder && !user?.isAdmin && (
        <TouchableOpacity 
          style={styles.orderStatusBlock}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.9}
        >
          <View style={styles.orderStatusContent}>
            <View style={styles.orderStatusLeft}>
              <Text style={styles.orderStatusTitle}>Заказ #{currentOrder.id}</Text>
              <Text style={styles.orderStatusSubtitle}>{currentOrder.total} ₽</Text>
            </View>
            <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(currentOrder.status) }]}>
              <Text style={styles.orderStatusBadgeText}>{getStatusText(currentOrder.status)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Admin Orders Section */}
      {user?.isAdmin && orders.length > 0 && (
        <View style={styles.adminOrdersSection}>
          <Text style={styles.adminOrdersTitle}>Заказы пользователей</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.adminOrdersScroll}
          >
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.adminOrderCard}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.9}
              >
                <View style={styles.adminOrderHeader}>
                  <Text style={styles.adminOrderId}>#{order.id}</Text>
                  <View style={[styles.adminOrderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.adminOrderStatusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                <Text style={styles.adminOrderTotal}>{order.total} ₽</Text>
                <Text style={styles.adminOrderDate}>
                  {new Date(order.createdAt).toLocaleString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === 'Все' && styles.filterButtonActive
          ]}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.filterButtonText,
            selectedCategory === 'Все' && styles.filterButtonTextActive
          ]}>Фильтр</Text>
        </TouchableOpacity>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
          style={styles.categoriesScroll}
        >
          {categories.filter(cat => cat.visible !== false).map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.name)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.name && styles.categoryButtonTextActive
              ]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        {...panResponder.panHandlers}
      >
        {CATEGORIES.map(category => {
          if (selectedCategory !== 'Все' && selectedCategory !== category) return null;
          
          const categoryDishes = dishes.filter(dish => 
            dish.category === category && 
            (user?.isAdmin || dish.available)
          );
          if (categoryDishes.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.dishesGrid}>
                {categoryDishes.map(renderDishCard)}
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.categoryModalContainer}>
          <View style={styles.categoryModalHeader}>
            <Text style={styles.categoryModalTitle}>Выберите категорию</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoryModalContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryModalItem,
                selectedCategory === 'Все' && styles.categoryModalItemActive
              ]}
              onPress={() => {
                setSelectedCategory('Все');
                setShowCategoryModal(false);
              }}
            >
              <Text style={[
                styles.categoryModalItemText,
                selectedCategory === 'Все' && styles.categoryModalItemTextActive
              ]}>Все категории</Text>
            </TouchableOpacity>
            
            {categories.filter(cat => cat.visible !== false).map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryModalItem,
                  selectedCategory === category.name && styles.categoryModalItemActive
                ]}
                onPress={() => {
                  setSelectedCategory(category.name);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.categoryModalItemText,
                  selectedCategory === category.name && styles.categoryModalItemTextActive
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDishModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDishModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDishModal(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
          </View>
          
          {selectedDish && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedDish.image }} style={styles.modalImage} />
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalDishName}>{selectedDish.name}</Text>
                
                {selectedDish.weight && (
                  <Text style={styles.modalWeight}>{selectedDish.weight}</Text>
                )}
                
                <Text style={styles.modalDescription}>{selectedDish.description}</Text>
                
                {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.ingredientsTitle}>Состав:</Text>
                    <Text style={styles.ingredientsText}>
                      {selectedDish.ingredients.join(', ')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalFooter}>
                  <Text style={styles.modalPrice}>{selectedDish.price} ₽</Text>
                  
                  <View style={styles.modalActions}>
                    {selectedDish.available ? (
                      <>
                        {getModalDishQuantity() > 0 ? (
                          <View style={styles.modalQuantityControls}>
                            <TouchableOpacity
                              style={styles.modalQuantityButton}
                              onPress={() => updateQuantity(selectedDish.id, getModalDishQuantity() - 1)}
                              activeOpacity={0.8}
                            >
                              <Minus color="#fff" size={18} />
                            </TouchableOpacity>
                            <Text style={styles.modalQuantityText}>{getModalDishQuantity()}</Text>
                            <TouchableOpacity
                              style={styles.modalQuantityButton}
                              onPress={() => updateQuantity(selectedDish.id, getModalDishQuantity() + 1)}
                              activeOpacity={0.8}
                            >
                              <Plus color="#fff" size={18} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={() => handleAddToCart(selectedDish)}
                          >
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addToCartText}>Добавить</Text>
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                          style={styles.goToCartButton}
                          onPress={handleGoToCart}
                        >
                          <ShoppingCart color="#9a4759" size={20} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.unavailableButton}>
                        <Text style={styles.unavailableButtonText}>Недоступно</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
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
  headerContainer: {
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'flex-end',
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
    marginTop: 10,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  restaurantInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    width: '48%',
  },
  dishImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover' as const,
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  dishDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  dishPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dishWeight: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500' as const,
  },
  dishWeightUnavailable: {
    color: '#ccc',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#9a4759',
    letterSpacing: 0.3,
  },
  dishActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  dishButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#9a4759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e8eaed',
    marginLeft: 20,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#9a4759',
    borderColor: '#9a4759',
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoriesScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e8eaed',
  },
  categoryButtonActive: {
    backgroundColor: '#9a4759',
    borderColor: '#9a4759',
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  categoryModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  categoryModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryModalItem: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryModalItemActive: {
    backgroundColor: '#f8f9fa',
  },
  categoryModalItemText: {
    fontSize: 18,
    color: '#333',
  },
  categoryModalItemTextActive: {
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  dishCardUnavailable: {
    opacity: 0.6,
  },
  dishImageUnavailable: {
    opacity: 0.5,
  },
  dishNameUnavailable: {
    color: '#999',
  },
  dishDescriptionUnavailable: {
    color: '#999',
  },
  dishPriceUnavailable: {
    color: '#999',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#9a4759',
    paddingHorizontal: 6,
    paddingVertical: 4,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
  quantityText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#9a4759',
    marginHorizontal: 10,
    minWidth: 18,
    textAlign: 'center' as const,
  },
  visibilityButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover' as const,
  },
  modalInfo: {
    padding: 20,
  },
  modalDishName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
  },
  modalWeight: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  ingredientsContainer: {
    marginBottom: 30,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addToCartButton: {
    backgroundColor: '#9a4759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  goToCartButton: {
    backgroundColor: '#f8f9fa',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9a4759',
  },
  unavailableButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  unavailableButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  orderStatusBlock: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderStatusLeft: {
    flex: 1,
  },
  orderStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  orderStatusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderStatusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  modalQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9a4759',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
    shadowColor: '#9a4759',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalQuantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuantityText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    minWidth: 30,
    textAlign: 'center' as const,
  },
  adminOrdersSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adminOrdersTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  adminOrdersScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  adminOrderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    width: 180,
    borderWidth: 1,
    borderColor: '#e8eaed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  adminOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminOrderId: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  adminOrderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminOrderStatusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#fff',
  },
  adminOrderTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#9a4759',
    marginBottom: 4,
  },
  adminOrderDate: {
    fontSize: 12,
    color: '#666',
  },
});
