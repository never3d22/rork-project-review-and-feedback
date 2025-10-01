# Настройка Backend на Vercel

## Проблема
Ошибка "Failed to fetch" при сохранении заказов возникает потому, что backend не развернут на Vercel.

## Решение

### 1. Проверьте переменные окружения на Vercel

Зайдите в настройки проекта на Vercel:
1. Откройте https://vercel.com/dashboard
2. Выберите ваш проект `rork-project-review-and-feedback-3ukzrxnx5`
3. Перейдите в Settings → Environment Variables
4. Добавьте следующие переменные:

```
TURSO_DATABASE_URL=libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
EXPO_PUBLIC_SMS_API_ID=457A5DBA-D814-BC10-DDD7-645DC659658E
```

### 2. Пересоберите проект

После добавления переменных окружения:
1. Перейдите в Deployments
2. Нажмите на последний деплой
3. Нажмите "Redeploy"

### 3. Проверьте работу API

После деплоя проверьте:
- https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api - должен вернуть `{"status":"ok","message":"API is running"}`
- https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app/api/trpc - должен работать tRPC endpoint

### 4. Инициализируйте базу данных

Выполните миграции для создания таблиц в Turso:

```bash
# Установите Turso CLI (если еще не установлен)
curl -sSfL https://get.tur.so/install.sh | bash

# Выполните миграции
bunx drizzle-kit push
```

## Текущее состояние

✅ **Локальное сохранение работает** - заказы сохраняются в AsyncStorage/localStorage
⚠️ **Backend требует настройки** - заказы не сохраняются в базу данных Turso

## Что происходит сейчас

1. Пользователь оформляет заказ
2. Приложение пытается сохранить заказ в базу данных через API
3. Если API недоступен, заказ сохраняется только локально
4. Заказ отображается в приложении, но не синхронизируется между устройствами

## После настройки backend

1. Заказы будут сохраняться в базу данных Turso
2. Заказы будут доступны на всех устройствах
3. Администратор сможет видеть все заказы в реальном времени
4. Данные будут сохраняться надежно на сервере

## Проверка работы

После настройки проверьте в консоли браузера/приложения:
- ✅ "Заказ успешно сохранен в базу данных!" - backend работает
- ⚠️ "Заказ сохранен только локально" - требуется настройка backend
