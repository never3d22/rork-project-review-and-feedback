# Полная настройка Vercel для работы с Turso

## Шаг 1: Переменные окружения в Vercel

Зайдите в настройки проекта на Vercel: **Settings → Environment Variables**

Добавьте следующие переменные для **всех окружений** (Production, Preview, Development):

### 1. База данных Turso (серверные переменные)
```
TURSO_DATABASE_URL=libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
```

### 2. URL API (клиентская переменная)
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://ваш-домен.vercel.app
```
**ВАЖНО:** Замените `ваш-домен.vercel.app` на ваш реальный production URL из Vercel!

Например:
- `https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app`
- или ваш кастомный домен

### 3. SMS API (клиентская переменная)
```
EXPO_PUBLIC_SMS_API_ID=457A5DBA-D814-BC10-DDD7-645DC659658E
```

## Шаг 2: Проверка переменных

После добавления переменных, у вас должно быть:

✅ **TURSO_DATABASE_URL** - для всех окружений
✅ **TURSO_AUTH_TOKEN** - для всех окружений  
✅ **EXPO_PUBLIC_RORK_API_BASE_URL** - для всех окружений
✅ **EXPO_PUBLIC_SMS_API_ID** - для всех окружений

## Шаг 3: Redeploy проекта

**КРИТИЧЕСКИ ВАЖНО:** После добавления переменных окружения нужно сделать Redeploy!

1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите на три точки (⋯) справа
4. Выберите **Redeploy**
5. Подтвердите действие

## Шаг 4: Проверка работы

После redeploy:

1. Откройте ваше приложение
2. Откройте консоль браузера (F12)
3. Попробуйте создать заказ
4. В консоли вы увидите детальные логи:
   - `[TRPC CLIENT] Getting base URL` - какой URL используется
   - `[TRPC] Making request` - детали запроса
   - `[TRPC] Response received` - ответ от сервера

## Возможные проблемы и решения

### Проблема 1: "Failed to fetch"
**Причина:** Неправильный URL или сервер недоступен
**Решение:** 
- Проверьте `EXPO_PUBLIC_RORK_API_BASE_URL` - должен быть ваш production URL
- Убедитесь, что сделали Redeploy после добавления переменных

### Проблема 2: "Unexpected token '<', "<!DOCTYPE"..."
**Причина:** API возвращает HTML вместо JSON (обычно 404 страница)
**Решение:**
- Проверьте, что API endpoint доступен: `https://ваш-домен.vercel.app/api/trpc`
- Проверьте логи Vercel на наличие ошибок сборки

### Проблема 3: "NOT NULL constraint failed"
**Причина:** В базу данных отправляются неполные данные
**Решение:** Уже исправлено в коде - все обязательные поля теперь заполняются

### Проблема 4: CORS ошибки
**Причина:** Неправильные настройки CORS
**Решение:** Уже настроено в `backend/hono.ts` - разрешены все origins

## Проверка логов на Vercel

1. Перейдите в **Deployments**
2. Выберите последний деплой
3. Нажмите **View Function Logs**
4. Здесь вы увидите серверные логи:
   - `[DB CLIENT] Initializing database connection`
   - `[HONO] Starting server initialization`
   - Ошибки подключения к базе данных (если есть)

## Тестирование API напрямую

Откройте в браузере:
```
https://ваш-домен.vercel.app/api
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

Если видите это - API работает! ✅

## Дополнительная информация

- Все переменные с префиксом `EXPO_PUBLIC_` доступны на клиенте
- Переменные без префикса доступны только на сервере
- После изменения переменных ВСЕГДА делайте Redeploy
- Логи в консоли браузера помогут найти проблему
