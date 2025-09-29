import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RestaurantProvider } from "@/store/restaurant-store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Назад" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: "Оформление заказа",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="admin" 
        options={{ 
          title: "Админ панель",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="auth/phone" 
        options={{ 
          title: "Вход в аккаунт",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="auth/verify" 
        options={{ 
          title: "Подтверждение",
          presentation: "modal"
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RestaurantProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </RestaurantProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
