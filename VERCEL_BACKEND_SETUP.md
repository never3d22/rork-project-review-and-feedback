# Настройка Backend на Vercel

## Проблема
Заказы не сохраняются в базу данных из-за ошибки "Failed to fetch". Это происходит потому, что backend на Vercel не настроен правильно.

## Решение

### 1. Настройка переменных окружения на Vercel

Зайдите в настройки вашего проекта на Vercel:
1. Откройте https://vercel.com/dashboard
2. Выберите ваш проект
3. Перейдите в Settings → Environment Variables
4. Добавьте следующие переменные:

```
TURSO_DATABASE_URL=libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
EXPO_PUBLIC_RORK_API_BASE_URL=https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app
EXPO_PUBLIC_SMS_API_ID=457A5DBA-D814-BC10-DDD7-645DC659658E
```

**ВАЖНО:** Убедитесь, что переменные добавлены для всех окружений (Production, Preview, Development)

### 2. Пересоберите проект

После добавления переменных окружения:
1. Перейдите в Deployments
2. Найдите последний деплой
3. Нажмите на три точки (⋯) → Redeploy
4. Выберите "Redeploy with existing Build Cache" или "Redeploy"

### 3. Проверка работы API

После деплоя проверьте, что API работает:

1. Откройте в браузере: `https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api`
   - Должен вернуться JSON: `{"status":"ok","message":"API is running"}`

2. Проверьте tRPC endpoint: `https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api/trpc`
   - Должен вернуться ответ от tRPC

### 4. Проверка в приложении

После настройки:
1. Откройте приложение
2. Добавьте товары в корзину
3. Оформите заказ
4. Проверьте консоль - должно быть сообщение "✅ Заказ успешно сохранен в базу данных!"

### 5. Проверка базы данных

Чтобы убедиться, что заказы сохраняются в Turso:

```bash
# Установите Turso CLI (если еще не установлен)
curl -sSfL https://get.tur.so/install.sh | bash

# Подключитесь к базе данных
turso db shell restaurant-app-never3d22

# Проверьте заказы
SELECT * FROM orders ORDER BY id DESC LIMIT 10;
```

## Что сейчас происходит

Сейчас приложение работает в "локальном режиме":
- ✅ Заказы сохраняются локально на устройстве
- ✅ Пользователь видит свои заказы
- ❌ Заказы НЕ сохраняются на сервере
- ❌ Администратор НЕ видит заказы от других пользователей

После настройки backend:
- ✅ Заказы сохраняются на сервере (Turso)
- ��� Администратор видит все заказы
- ✅ Данные синхронизируются между устройствами
- ✅ Данные не теряются при переустановке приложения

## Дополнительная диагностика

Если после настройки все еще есть проблемы:

1. Проверьте логи Vercel:
   - Откройте проект на Vercel
   - Перейдите в Deployments → выберите последний деплой → View Function Logs

2. Проверьте консоль браузера/приложения:
   - Должны быть подробные логи о попытке сохранения заказа
   - Ищите сообщения с "🔄", "✅" или "❌"

3. Проверьте CORS:
   - Backend уже настроен с `cors()` middleware
   - Если проблемы с CORS, проверьте настройки в `backend/hono.ts`

## Альтернативное решение (если Vercel не работает)

Если не получается настроить на Vercel, можно:

1. Использовать другой хостинг (Railway, Render, Fly.io)
2. Запустить backend локально для тестирования
3. Использовать только локальное хранилище (текущий режим)

## Контакты для поддержки

Если проблемы остаются:
1. Проверьте логи в консоли приложения
2. Проверьте логи на Vercel
3. Убедитесь, что все переменные окружения установлены правильно
