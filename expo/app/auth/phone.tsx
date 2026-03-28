import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';
import { Phone } from 'lucide-react-native';

export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { sendSMSCode } = useRestaurant();

  const formatPhoneNumber = (text: string): string => {
    // Удаляем все символы кроме цифр
    const cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем длину до 11 цифр (для российских номеров)
    const limited = cleaned.slice(0, 11);
    
    // Форматируем номер
    if (limited.length === 0) return '';
    if (limited.length <= 1) return `+7 (${limited}`;
    if (limited.length <= 4) return `+7 (${limited.slice(1)}`;
    if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
    return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9)}`;
  };

  const getCleanPhoneNumber = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };

  const handleSendCode = async () => {
    const cleanPhone = getCleanPhoneNumber(phone);
    
    if (cleanPhone.length !== 11) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    
    try {
      // Имитируем отправку SMS
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = await sendSMSCode(cleanPhone);
      
      if (success) {
        router.push({
          pathname: '/auth/verify' as any,
          params: { phone: cleanPhone }
        });
      } else {
        Alert.alert('Ошибка', 'Не удалось отправить код. Попробуйте еще раз.');
      }
    } catch {
      Alert.alert('Ошибка', 'Произошла ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Phone size={32} color="#007AFF" />
            </View>
            <Text style={styles.title}>Вход в аккаунт</Text>
            <Text style={styles.subtitle}>
              Введите номер телефона для получения SMS-кода
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Номер телефона</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="+7 (999) 123-45-67"
                keyboardType="phone-pad"
                maxLength={18}
                autoFocus
                testID="phone-input"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!phone || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleSendCode}
              disabled={!phone || isLoading}
              testID="send-code-button"
            >
              <Text style={[
                styles.buttonText,
                (!phone || isLoading) && styles.buttonTextDisabled
              ]}>
                {isLoading ? 'Отправляем...' : 'Получить код'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Нажимая &quot;Получить код&quot;, вы соглашаетесь с условиями использования
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});