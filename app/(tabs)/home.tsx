import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Tab</Text>
      <Text style={styles.subtitle}>This is the home tab content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
