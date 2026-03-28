# Интеграция платежных систем

## СБП (Система Быстрых Платежей)

### Где добавить ключи:
1. Создайте файл `.env` в корне проекта (если еще не создан)
2. Добавьте следующие переменные:

```env
# СБП
EXPO_PUBLIC_SBP_MERCHANT_ID=ваш_merchant_id
EXPO_PUBLIC_SBP_API_KEY=ваш_api_key
EXPO_PUBLIC_SBP_SECRET_KEY=ваш_secret_key
```

### Где использовать:
- Файл: `app/checkout.tsx`
- Функция: `handlePlaceOrder()`
- Когда `paymentMethod === 'online'` и выбран СБП

### Пример интеграции:

```typescript
// В app/checkout.tsx

const processSBPPayment = async (orderId: string, amount: number) => {
  try {
    const response = await fetch('https://api.sbp.ru/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SBP_API_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: process.env.EXPO_PUBLIC_SBP_MERCHANT_ID,
        order_id: orderId,
        amount: amount,
        currency: 'RUB',
        description: `Заказ #${orderId}`,
      }),
    });
    
    const data = await response.json();
    
    if (data.payment_url) {
      // Открыть URL для оплаты
      Linking.openURL(data.payment_url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('СБП payment error:', error);
    return false;
  }
};
```

## SberPay

### Где добавить ключи:
В файле `.env`:

```env
# SberPay
EXPO_PUBLIC_SBERPAY_MERCHANT_ID=ваш_merchant_id
EXPO_PUBLIC_SBERPAY_API_KEY=ваш_api_key
EXPO_PUBLIC_SBERPAY_SECRET_KEY=ваш_secret_key
```

### Где использовать:
- Файл: `app/checkout.tsx`
- Функция: `handlePlaceOrder()`
- Когда `paymentMethod === 'online'` и выбран SberPay

### Пример интеграции:

```typescript
// В app/checkout.tsx

const processSberPayPayment = async (orderId: string, amount: number) => {
  try {
    const response = await fetch('https://securepayments.sberbank.ru/payment/rest/register.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: process.env.EXPO_PUBLIC_SBERPAY_MERCHANT_ID,
        password: process.env.EXPO_PUBLIC_SBERPAY_API_KEY,
        orderNumber: orderId,
        amount: amount * 100, // в копейках
        returnUrl: 'yourapp://payment/success',
        failUrl: 'yourapp://payment/fail',
      }),
    });
    
    const data = await response.json();
    
    if (data.formUrl) {
      // Открыть URL для оплаты
      Linking.openURL(data.formUrl);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('SberPay payment error:', error);
    return false;
  }
};
```

## Обновление UI для выбора платежной системы

В `app/checkout.tsx` нужно добавить выбор между СБП и SberPay когда выбрана онлайн оплата:

```typescript
const [onlinePaymentType, setOnlinePaymentType] = useState<'sbp' | 'sberpay'>('sbp');

// В секции способов оплаты, когда paymentMethod === 'online':
{paymentMethod === 'online' && (
  <View style={styles.onlinePaymentOptions}>
    <TouchableOpacity
      style={[
        styles.onlineOption,
        onlinePaymentType === 'sbp' && styles.onlineOptionActive
      ]}
      onPress={() => setOnlinePaymentType('sbp')}
    >
      <Text>СБП</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.onlineOption,
        onlinePaymentType === 'sberpay' && styles.onlineOptionActive
      ]}
      onPress={() => setOnlinePaymentType('sberpay')}
    >
      <Text>SberPay</Text>
    </TouchableOpacity>
  </View>
)}
```

## Важные замечания:

1. **Безопасность**: Никогда не храните секретные ключи в коде. Используйте `.env` файл и добавьте его в `.gitignore`

2. **Тестовый режим**: Большинство платежных систем предоставляют тестовые ключи для разработки

3. **Webhook**: Настройте webhook URL для получения уведомлений о статусе платежа

4. **Deep Links**: Настройте deep links в `app.json` для возврата в приложение после оплаты:

```json
{
  "expo": {
    "scheme": "yourapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

5. **Обработка результата**: Добавьте экраны для успешной и неуспешной оплаты:
   - `app/payment/success.tsx`
   - `app/payment/fail.tsx`
