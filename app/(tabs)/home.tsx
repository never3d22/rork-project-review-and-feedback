import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, MapPin, Eye, EyeOff } from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES } from '@/constants/dishes';
import { Dish } from '@/types/restaurant';

export default function MenuScreen() {
  const { dishes, addToCart, restaurant, user, toggleDishVisibility } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const insets = useSafeAreaInsets();

  const renderDishCard = (item: Dish) => (
    <View key={item.id} style={[styles.dishCard, !item.available && styles.dishCardUnavailable]}>
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
                onPress={() => toggleDishVisibility(item.id)}
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
                onPress={() => addToCart(item)}
              >
                <Plus color="#fff" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              selectedCategory === 'Все' && styles.categoryFilterActive
            ]}
            onPress={() => setSelectedCategory('Все')}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === 'Все' && styles.categoryFilterTextActive
            ]}>Все</Text>
          </TouchableOpacity>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                selectedCategory === category && styles.categoryFilterActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryFilterText,
                selectedCategory === category && styles.categoryFilterTextActive
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9a4759',
    marginRight: 8,
  },
  categoryFilterActive: {
    backgroundColor: '#9a4759',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#9a4759',
    fontWeight: '600' as const,
  },
  categoryFilterTextActive: {
    color: '#fff',
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
});
