import React, { useState, useRef, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useRestaurant } from '@/store/restaurant-store';
import { Shield, ArrowLeft } from 'lucide-react-native';

export default function VerifyCodeScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const { verifySMSCode, sendSMSCode } = useRestaurant();
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatPhoneForDisplay = (phoneNumber: string): string => {
    if (phoneNumber.length === 11) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9)}`;
    }
    return phoneNumber;
  };

  const handleCodeChange = (text: string, index: number) => {
    // Удаляем все нецифровые символы
    const cleanText = text.replace(/\D/g, '');
    
    if (cleanText.length > 1) {
      // Если вставили несколько символов (например, скопировали код)
      const digits = cleanText.slice(0, 6);
      const newCode = [...code];
      
      // Заполняем поля начиная с текущего индекса
      for (let i = 0; i < digits.length && (index + i) < 6; i++) {
        newCode[index + i] = digits[i];
      }
      
      setCode(newCode);
      
      // Фокусируемся на следующем пустом поле или последнем заполненном
      const nextIndex = Math.min(index + digits.length, 5);
      requestAnimationFrame(() => {
        inputRefs.current[nextIndex]?.focus();
      });
      return;
    }

    // Обычный ввод одной цифры
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    // Автоматически переходим к следующему полю при вводе цифры
    if (cleanText && index < 5) {
      requestAnimationFrame(() => {
        inputRefs.current[index + 1]?.focus();
      });
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Очищаем предыдущее поле и фокусируемся на нем
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      requestAnimationFrame(() => {
        inputRefs.current[index - 1]?.focus();
      });
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('Ошибка', 'Введите полный код из 6 цифр');
      return;
    }

    if (!phone) {
      Alert.alert('Ошибка', 'Номер телефона не найден');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await verifySMSCode(phone, fullCode);
      
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Ошибка', 'Неверный код. Попробуйте еще раз.');
        // Очищаем поля и фокусируемся на первом
        setCode(['', '', '', '', '', '']);
        requestAnimationFrame(() => {
          inputRefs.current[0]?.focus();
        });
      }
    } catch {
      Alert.alert('Ошибка', 'Произошла ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!phone) return;
    
    try {
      await sendSMSCode(phone);
      setTimeLeft(60);
      Alert.alert('Успешно', 'Код отправлен повторно');
    } catch {
      Alert.alert('Ошибка', 'Не удалось отправить код повторно');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={32} color="#007AFF" />
            </View>
            <Text style={styles.title}>Подтверждение</Text>
            <Text style={styles.subtitle}>
              Введите код из SMS, отправленный на номер
            </Text>
            <Text style={styles.phoneNumber}>
              {phone ? formatPhoneForDisplay(phone) : ''}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  selectTextOnFocus
                  autoFocus={index === 0}
                  blurOnSubmit={false}
                  returnKeyType="next"
                  testID={`code-input-${index}`}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (code.join('').length !== 6 || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleVerifyCode}
              disabled={code.join('').length !== 6 || isLoading}
              testID="verify-button"
            >
              <Text style={[
                styles.buttonText,
                (code.join('').length !== 6 || isLoading) && styles.buttonTextDisabled
              ]}>
                {isLoading ? 'Проверяем...' : 'Подтвердить'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              {timeLeft > 0 ? (
                <Text style={styles.timerText}>
                  Повторная отправка через {timeLeft} сек
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text style={styles.resendText}>
                    Отправить код повторно
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  codeInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#999999',
  },
  resendText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});