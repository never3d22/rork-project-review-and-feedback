import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react-native';
import { useRestaurant } from '@/store/restaurant-store';
import { Order } from '@/types/restaurant';

export default function OrdersScreen() {
  const { orders, updateOrderStatus, user } = useRestaurant();
  const insets = useSafeAreaInsets();

  if (!user?.isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.noAccessText}>Доступ запрещен</Text>
      </View>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'preparing');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'preparing': return '#2196F3';
      case 'ready': return '#4CAF50';
      case 'delivered': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'В обработке';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivered': return 'Выдан';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const renderOrderCard = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId}>Заказ #{order.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderType}>
          {order.deliveryType === 'delivery' ? '🚗 Доставка' : '🏃 Самовывоз'}
        </Text>
        <Text style={styles.orderTotal}>{order.total} ₽</Text>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.orderItem}>
            {item.dish.name} x{item.quantity}
          </Text>
        ))}
      </View>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <View style={styles.orderActions}>
          {order.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.preparingButton]}
              onPress={() => updateOrderStatus(order.id, 'preparing')}
            >
              <Clock color="#fff" size={18} />
              <Text style={styles.actionButtonText}>Готовить</Text>
            </TouchableOpacity>
          )}
          {order.status === 'preparing' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.readyButton]}
              onPress={() => updateOrderStatus(order.id, 'ready')}
            >
              <Package color="#fff" size={18} />
              <Text style={styles.actionButtonText}>Готов</Text>
            </TouchableOpacity>
          )}
          {order.status === 'ready' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deliveredButton]}
              onPress={() => updateOrderStatus(order.id, 'delivered')}
            >
              <CheckCircle color="#fff" size={18} />
              <Text style={styles.actionButtonText}>Выдан</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ФИРАУСИ</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock color="#FFA500" size={24} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{pendingOrders.length}</Text>
              <Text style={styles.statLabel}>В обработке</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <XCircle color="#F44336" size={24} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{cancelledOrders.length}</Text>
              <Text style={styles.statLabel}>Отменено</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package color="#ccc" size={64} />
            <Text style={styles.emptyText}>Заказов пока нет</Text>
          </View>
        ) : (
          <>
            {pendingOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Активные заказы</Text>
                {pendingOrders.map(renderOrderCard)}
              </View>
            )}

            {orders.filter(o => o.status === 'ready').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Готовы к выдаче</Text>
                {orders.filter(o => o.status === 'ready').map(renderOrderCard)}
              </View>
            )}

            {orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>История</Text>
                {orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').map(renderOrderCard)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#D4AF37',
    letterSpacing: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderType: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500' as const,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#9a4759',
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  preparingButton: {
    backgroundColor: '#2196F3',
  },
  readyButton: {
    backgroundColor: '#4CAF50',
  },
  deliveredButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  noAccessText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center' as const,
    marginTop: 40,
  },
});
