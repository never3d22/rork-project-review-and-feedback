# Настройка SMS для аутентификации

## Проблема
В данный момент SMS-коды только имитируются и выводятся в консоль. Для реальной отправки SMS нужно интегрировать SMS-провайдера.

## Решение

### 1. Выберите SMS-провайдера

#### SMS.ru (Рекомендуется для России)
- Сайт: https://sms.ru/
- Цена: от 1.5 руб за SMS
- Простая интеграция
- Хорошая доставляемость в России

#### Twilio (Международный)
- Сайт: https://www.twilio.com/
- Цена: от $0.0075 за SMS
- Отличная документация
- Работает по всему миру

#### SMSC.ru (Для России и СНГ)
- Сайт: https://smsc.ru/
- Цена: от 1.2 руб за SMS
- Старый, но надежный провайдер

### 2. Настройка SMS.ru (пример)

1. **Регистрация:**
   - Зайдите на https://sms.ru/
   - Зарегистрируйтесь и подтвердите аккаунт
   - Пополните баланс

2. **Получите API ключ:**
   - В личном кабинете перейдите в "API"
   - Скопируйте ваш API ID

3. **Замените в коде:**
   ```typescript
   const SMS_API_ID = 'YOUR_SMS_RU_API_ID'; // Замените на ваш реальный API ID
   ```

### 3. Настройка Twilio (альтернатива)

1. **Регистрация:**
   - Зайдите на https://www.twilio.com/
   - Создайте аккаунт и получите пробный кредит

2. **Получите учетные данные:**
   - Account SID
   - Auth Token
   - Номер телефона Twilio

3. **Замените функцию sendRealSMS:**
   ```typescript
   const sendRealSMS = async (phone: string, code: string): Promise<boolean> => {
     try {
       const TWILIO_ACCOUNT_SID = 'your_account_sid';
       const TWILIO_AUTH_TOKEN = 'your_auth_token';
       const TWILIO_PHONE = 'your_twilio_phone';
       
       const message = `Ваш код подтверждения: ${code}`;
       
       const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
         method: 'POST',
         headers: {
           'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
           'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
           From: TWILIO_PHONE,
           To: phone,
           Body: message
         })
       });
       
       if (response.ok) {
         console.log('SMS успешно отправлено через Twilio');
         return true;
       } else {
         console.error('Ошибка Twilio API:', await response.text());
         return false;
       }
     } catch (error) {
       console.error('Ошибка при отправке SMS через Twilio:', error);
       return false;
     }
   };
   ```

### 4. Безопасность

**ВАЖНО:** Никогда не храните API ключи в коде!

Используйте переменные окружения:
```typescript
const SMS_API_ID = process.env.EXPO_PUBLIC_SMS_API_ID;
```

Добавьте в `.env`:
```
EXPO_PUBLIC_SMS_API_ID=your_actual_api_id
```

### 5. Тестирование

В режиме разработки код будет показываться в консоли, даже если SMS не отправится. Это позволяет тестировать без трат на SMS.

### 6. Дополнительные возможности

- **Шаблоны сообщений:** Настройте красивые шаблоны SMS
- **Ограничения:** Добавьте лимиты на количество SMS в день
- **Логирование:** Ведите лог отправленных SMS
- **Fallback:** Используйте несколько провайдеров для надежности

## Текущее состояние

Сейчас в коде:
- ✅ Генерация кодов работает
- ✅ Проверка кодов работает  
- ✅ Интерфейс готов
- ❌ Реальная отправка SMS не настроена (нужен API ключ)

После настройки API ключа SMS будут отправляться реально!