import { Tabs } from "expo-router";
import { Home, ShoppingCart, User } from "lucide-react-native";
import React from "react";
import { useRestaurant } from "@/store/restaurant-store";

export default function TabLayout() {
  const { cart } = useRestaurant();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B6B",
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
