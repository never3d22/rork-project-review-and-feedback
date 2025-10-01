# Настройка переменных окружения на Vercel

## Проблема
Приложение не может сохранять заказы в базу данных из-за ошибки "Failed to fetch". Это происходит потому, что на Vercel не установлены переменные окружения для подключения к базе данных Turso.

## Решение

### Шаг 1: Откройте настройки проекта на Vercel

1. Перейдите на https://vercel.com
2. Откройте ваш проект: **rork-project-review-and-feedback-3ukzrxnx5**
3. Перейдите в раздел **Settings** (Настройки)
4. Выберите **Environment Variables** (Переменные окружения)

### Шаг 2: Добавьте переменные окружения

Добавьте следующие переменные окружения:

#### 1. TURSO_DATABASE_URL
```
libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io
```
- **Environment**: Production, Preview, Development (выберите все)

#### 2. TURSO_AUTH_TOKEN
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
```
- **Environment**: Production, Preview, Development (выберите все)

#### 3. EXPO_PUBLIC_SMS_API_ID (опционально, для SMS)
```
457A5DBA-D814-BC10-DDD7-645DC659658E
```
- **Environment**: Production, Preview, Development (выберите все)

### Шаг 3: Пересоберите проект

После добавления переменных окружения:

1. Перейдите в раздел **Deployments** (Развертывания)
2. Найдите последнее развертывание
3. Нажмите на три точки (...) справа
4. Выберите **Redeploy** (Пересобрать)
5. Убедитесь, что выбрана опция **Use existing Build Cache** (снимите галочку для чистой пересборки)
6. Нажмите **Redeploy**

### Шаг 4: Проверьте работу

После пересборки:

1. Откройте приложение
2. Попробуйте создать заказ
3. Проверьте логи в консоли браузера
4. Заказ должен успешно сохраниться в базу данных

## Проверка логов на Vercel

Если проблема сохраняется:

1. Перейдите в раздел **Deployments**
2. Откройте последнее развертывание
3. Перейдите в **Runtime Logs** (Логи выполнения)
4. Проверьте наличие ошибок подключения к базе данных

## Дополнительная информация

### Структура базы данных

База данных Turso содержит следующие таблицы:
- `users` - пользователи
- `dishes` - блюда
- `categories` - категории
- `orders` - заказы
- `restaurant` - настройки ресторана
- `sms_codes` - коды SMS для авторизации

### API эндпоинты

- **Base URL**: https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app
- **tRPC API**: https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api/trpc
- **Health Check**: https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api

### Тестирование API

Вы можете протестировать API напрямую:

```bash
# Health check
curl https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api

# Должен вернуть: {"status":"ok","message":"API is running"}
```

## Что было исправлено в коде

1. **Улучшена конфигурация CORS** в `backend/hono.ts`
   - Добавлены все необходимые заголовки
   - Разрешены все методы HTTP

2. **Добавлено логирование в tRPC клиент** (`lib/trpc.ts`)
   - Теперь все запросы и ответы логируются в консоль
   - Легче отследить проблемы с подключением

3. **Улучшена обработка ошибок** в `backend/trpc/routes/orders/create.ts`
   - Добавлено подробное логирование
   - Лучшая обработка null значений

## Контакты для поддержки

Если проблема не решается:
1. Проверьте логи на Vercel
2. Проверьте логи в консоли браузера
3. Убедитесь, что все переменные окружения установлены правильно
