import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, MapPin, Eye, EyeOff, X, ShoppingCart, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES } from '@/constants/dishes';
import { Dish } from '@/types/restaurant';

export default function MenuScreen() {
  const { dishes, addToCart, restaurant, user, toggleDishVisibility } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showDishModal, setShowDishModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const handleDishPress = (dish: Dish) => {
    setSelectedDish(dish);
    setShowDishModal(true);
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish);
    setShowDishModal(false);
  };

  const handleGoToCart = () => {
    setShowDishModal(false);
    router.push('/(tabs)/cart');
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

  const renderDishCard = (item: Dish) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.dishCard, !item.available && styles.dishCardUnavailable]}
      onPress={() => item.available ? handleDishPress(item) : null}
      activeOpacity={item.available ? 0.8 : 1}
      disabled={!item.available}
    >
      <Image source={{ uri: item.image }} style={[styles.dishImage, !item.available && styles.dishImageUnavailable]} />
      <View style={styles.dishInfo}>
        <Text style={[styles.dishName, !item.available && styles.dishNameUnavailable]}>{item.name}</Text>
        <Text style={[styles.dishDescription, !item.available && styles.dishDescriptionUnavailable]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.dishFooter}>
          <Text style={[styles.dishPrice, !item.available && styles.dishPriceUnavailable]}>{item.price} ₽</Text>
          <View style={styles.dishActions}>
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
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(item);
                }}
              >
                <Plus color="#fff" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#9a4759', '#b85a6e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
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
        </View>
      </LinearGradient>

      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Filter color="#9a4759" size={20} />
          <Text style={styles.filterButtonText}>
            {selectedCategory === 'Все' ? 'Фильтр' : selectedCategory}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
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
              {categoryDishes.map(renderDishCard)}
            </View>
          );
        })}
      </ScrollView>

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
            
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryModalItem,
                  selectedCategory === category && styles.categoryModalItemActive
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.categoryModalItemText,
                  selectedCategory === category && styles.categoryModalItemTextActive
                ]}>{category}</Text>
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
                        <TouchableOpacity
                          style={styles.addToCartButton}
                          onPress={() => handleAddToCart(selectedDish)}
                        >
                          <Plus color="#fff" size={20} />
                          <Text style={styles.addToCartText}>Добавить</Text>
                        </TouchableOpacity>
                        
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginTop: 10,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 12,
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
    color: '#333',
    marginBottom: 16,
  },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  dishImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover' as const,
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  addButton: {
    backgroundColor: '#9a4759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#9a4759',
    backgroundColor: '#fff',
    gap: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#9a4759',
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
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityButton: {
    padding: 8,
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
});
