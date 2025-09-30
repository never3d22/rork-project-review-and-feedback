# Настройка платежных систем

Приложение поддерживает следующие способы оплаты:

## 1. Банковская карта
Для интеграции с банковскими картами используйте один из следующих провайдеров:

### Вариант A: Stripe
```bash
bun expo install @stripe/stripe-react-native
```

**Где добавить API ключи:**
- Создайте файл `.env` в корне проекта
- Добавьте:
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_ваш_ключ
STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ
```

**Где использовать:**
- В файле `app/(tabs)/cart.tsx` в функции `handleCheckout`
- Добавьте логику оплаты после строки 437 (перед созданием заказа)

### Вариант B: Cloudpayments
```bash
bun install cloudpayments
```

**Где добавить API ключи:**
```
EXPO_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID=ваш_public_id
CLOUDPAYMENTS_API_SECRET=ваш_api_secret
```

## 2. SberPay
Для интеграции с SberPay используйте Sber Business API:

**Документация:** https://developer.sber.ru/doc/v1/sberbank-acquiring

**Где добавить API ключи:**
```
EXPO_PUBLIC_SBER_MERCHANT_ID=ваш_merchant_id
SBER_API_USERNAME=ваш_username
SBER_API_PASSWORD=ваш_password
```

**Где использовать:**
- В файле `app/(tabs)/cart.tsx` в функции `handleCheckout`
- Проверьте `paymentMethod === 'sberpay'` и вызовите API Сбербанка

**Пример интеграции:**
```typescript
if (paymentMethod === 'sberpay') {
  const response = await fetch('https://securepayments.sberbank.ru/payment/rest/register.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: process.env.SBER_API_USERNAME,
      password: process.env.SBER_API_PASSWORD,
      orderNumber: newOrderId,
      amount: getCartTotal() * 100, // в копейках
      returnUrl: 'your-app://payment-success',
    })
  });
  const data = await response.json();
  // Откройте data.formUrl в WebView или браузере
}
```

## 3. Наличные
Оплата наличными не требует интеграции с платежными системами.
Заказ создается со статусом 'pending' и оплачивается при получении.

## 4. СБП (Система Быстрых Платежей)
Для интеграции с СБП используйте один из банков-участников:

### Вариант A: Тинькофф
**Документация:** https://www.tinkoff.ru/kassa/develop/api/

**Где добавить API ключи:**
```
EXPO_PUBLIC_TINKOFF_TERMINAL_KEY=ваш_terminal_key
TINKOFF_SECRET_KEY=ваш_secret_key
```

**Пример интеграции:**
```typescript
if (paymentMethod === 'sbp') {
  const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      TerminalKey: process.env.EXPO_PUBLIC_TINKOFF_TERMINAL_KEY,
      Amount: getCartTotal() * 100, // в копейках
      OrderId: newOrderId,
      PayType: 'SBP',
    })
  });
  const data = await response.json();
  // Откройте data.PaymentURL для оплаты через СБП
}
```

### Вариант B: ЮKassa (Яндекс.Касса)
**Документация:** https://yookassa.ru/developers/api

**Где добавить API ключи:**
```
EXPO_PUBLIC_YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
```

## Где изменить код для интеграции

### Основной файл: `app/(tabs)/cart.tsx`

Найдите функцию `handleCheckout` (строка 425) и добавьте логику оплаты:

```typescript
const handleCheckout = async () => {
  if (cart.length === 0) return;
  
  if (!user) {
    setShowPhoneModal(true);
    return;
  }
  
  if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
    alert('Пожалуйста, укажите адрес доставки');
    return;
  }

  try {
    // ДОБАВЬТЕ ЗДЕСЬ ЛОГИКУ ОПЛАТЫ
    if (paymentMethod === 'card') {
      // Интеграция с картами (Stripe/Cloudpayments)
      // const paymentResult = await processCardPayment();
      // if (!paymentResult.success) return;
    } else if (paymentMethod === 'sberpay') {
      // Интеграция с SberPay
      // const paymentResult = await processSberPayment();
      // if (!paymentResult.success) return;
    } else if (paymentMethod === 'sbp') {
      // Интеграция с СБП
      // const paymentResult = await processSBPPayment();
      // if (!paymentResult.success) return;
    }
    // Для наличных (cash) - оплата не требуется
    
    if (deliveryAddress && deliveryAddress.trim()) {
      addAddress(deliveryAddress.trim());
    }
    
    const newOrderId = createOrder({
      items: cart,
      total: getCartTotal(),
      utensils: utensilsCount > 0,
      utensilsCount,
      paymentMethod,
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      deliveryTime,
      comments,
    });
    
    setOrderId(newOrderId);
    setShowSuccessModal(true);
    clearCart();
    setDeliveryAddress('');
    setComments('');
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Ошибка при оформлении заказа');
  }
};
```

## Рекомендации по безопасности

1. **Никогда не храните секретные ключи в коде**
   - Используйте `.env` файл
   - Добавьте `.env` в `.gitignore`

2. **Используйте серверную часть для критичных операций**
   - Секретные ключи должны быть только на сервере
   - Клиент должен отправлять запросы на ваш backend
   - Backend обрабатывает платежи и взаимодействует с платежными системами

3. **Проверяйте статус платежа**
   - Используйте webhooks для получения уведомлений о статусе
   - Не полагайтесь только на ответ от клиента

## Тестовые данные

### Stripe тестовые карты:
- Успешная оплата: `4242 4242 4242 4242`
- Отклонена: `4000 0000 0000 0002`

### Cloudpayments тестовые карты:
- Успешная оплата: `4111 1111 1111 1111`

### Тинькофф тестовые данные:
- Используйте тестовый терминал из личного кабинета

## Дополнительная информация

Для полной интеграции рекомендуется:
1. Создать backend API для обработки платежей
2. Использовать webhooks для отслеживания статуса
3. Реализовать возвраты и отмены платежей
4. Добавить логирование всех транзакций
