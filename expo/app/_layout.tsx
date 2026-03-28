import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RestaurantProvider } from "@/store/restaurant-store";
import { trpc, trpcClient } from "@/lib/trpc";

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
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("App starting...");
        console.log("API Base URL:", process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
        await SplashScreen.hideAsync();
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Ошибка инициализации:</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#9a4759" />
      </View>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RestaurantProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </RestaurantProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
