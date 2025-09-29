import React from 'react';
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
import { Plus, Clock, MapPin } from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';
import { CATEGORIES } from '@/constants/dishes';
import { Dish } from '@/types/restaurant';

export default function MenuScreen() {
  const { dishes, addToCart, restaurant } = useRestaurant();
  const insets = useSafeAreaInsets();

  const renderDishCard = (item: Dish) => (
    <View key={item.id} style={styles.dishCard}>
      <Image source={{ uri: item.image }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>{item.price} ₽</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item)}
          >
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(category => {
          const categoryDishes = dishes.filter(dish => dish.category === category && dish.available);
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
    color: '#FF6B6B',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
