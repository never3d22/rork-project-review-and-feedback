import { Tabs } from "expo-router";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react-native";
import React from "react";
import { useRestaurant } from "@/store/restaurant-store";

export default function TabLayout() {
  const { cart, orders, user } = useRestaurant();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrdersCount = orders.filter(order => order.status === 'pending' || order.status === 'preparing').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#9a4759",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Меню",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Корзина",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined,
        }}
      />
      {user?.isAdmin && (
        <Tabs.Screen
          name="orders"
          options={{
            title: "Заказы",
            tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
            tabBarBadge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
            href: user?.isAdmin ? '/(tabs)/orders' : null,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
