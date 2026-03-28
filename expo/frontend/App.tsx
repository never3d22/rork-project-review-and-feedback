import React from 'react';
import { View, Text, Button, Alert } from 'react-native';

export default function App() {
  const handleCheckout = async () => {
    try {
      const res = await fetch('https://rork-project-review-and-feedback.vercel.app/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: 1, name: 'Pizza', price: 12 },
            { id: 2, name: 'Salad', price: 8 }
          ],
          total: 20
        })
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert('Заказ сохранён!', `ID заказа: ${data.orderId}`);
      } else {
        Alert.alert('Ошибка', data.error);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка сети', err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Restaurant App</Text>
      <Button title="Checkout" onPress={handleCheckout} />
    </View>
  );
}
