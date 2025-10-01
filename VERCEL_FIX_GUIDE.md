# Руководство по исправлению ошибок Vercel

## Проблемы
1. ❌ SMS не отправляется: "Failed to fetch"
2. ❌ Заказы не сохраняются: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

## Причина
API возвращает HTML вместо JSON, потому что:
- Переменные окружения не настроены в Vercel
- База данных Turso не подключена

## Решение

### Шаг 1: Настройка переменных окружения в Vercel

1. Откройте ваш проект в Vercel: https://vercel.com/vitalys-projects-99672749/rork-project-review-and-feedback

2. Перейдите в **Settings** → **Environment Variables**

3. Добавьте следующие переменные для **Production**, **Preview** и **Development**:

```
TURSO_DATABASE_URL=libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
EXPO_PUBLIC_SMS_API_ID=457A5DBA-D814-BC10-DDD7-645DC659658E
```

**ВАЖНО:** Для каждой переменной выберите все три окружения:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Шаг 2: Инициализация базы данных

После добавления переменных окружения, нужно создать таблицы в базе данных:

1. Установите Turso CLI (если еще не установлен):
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Войдите в Turso:
```bash
turso auth login
```

3. Подключитесь к вашей базе данных:
```bash
turso db shell restaurant-app
```

4. Создайте таблицы (скопируйте и вставьте весь блок):
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birthday TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  addresses TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  weight TEXT,
  ingredients TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_phone TEXT,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  utensils INTEGER NOT NULL DEFAULT 0,
  utensils_count INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  delivery_address TEXT,
  delivery_time TEXT,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  cancel_reason TEXT,
  cancelled_at INTEGER,
  payment_status TEXT,
  payment_id TEXT,
  payment_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS restaurant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  delivery_min_time INTEGER NOT NULL,
  delivery_max_time INTEGER NOT NULL,
  pickup_min_time INTEGER NOT NULL,
  pickup_max_time INTEGER NOT NULL,
  logo TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sms_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

5. Проверьте, что таблицы созданы:
```sql
.tables
```

Вы должны увидеть: `categories  dishes  orders  restaurant  sms_codes  users`

6. Выйдите из shell:
```sql
.quit
```

### Шаг 3: Повторный деплой

После настройки переменных окружения Vercel автоматически сделает редеплой.

Если этого не произошло:
1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите на три точки (⋯) → **Redeploy**

### Шаг 4: Проверка

1. Откройте ваше приложение: https://rork-project-review-and-feedback.vercel.app

2. Попробуйте:
   - Отправить SMS код (должно работать)
   - Создать заказ (должен сохраниться в базу данных)

3. Проверьте логи в Vercel:
   - Перейдите в **Deployments** → выберите последний деплой → **Functions**
   - Откройте `/api/index` → посмотрите логи

Вы должны увидеть:
```
✅ [DB CLIENT] Database connection initialized successfully
✅ [HONO] Server initialization complete
```

### Шаг 5: Проверка базы данных

Проверьте, что заказы сохраняются:

```bash
turso db shell restaurant-app
```

```sql
SELECT * FROM orders;
```

Вы должны увидеть созданные заказы.

## Что было исправлено в коде

1. ✅ Добавлен маршрут `/api` в `vercel.json`
2. ✅ Улучшена обработка ошибок в `backend/hono.ts`
3. ✅ Добавлены логи для отладки

## Если проблемы остались

### Проблема: "Failed to fetch"

**Решение:**
1. Проверьте, что переменные окружения добавлены для всех окружений (Production, Preview, Development)
2. Сделайте редеплой
3. Очистите кэш браузера (Ctrl+Shift+R или Cmd+Shift+R)

### Проблема: "<!DOCTYPE" ошибка

**Решение:**
1. Убедитесь, что база данных инициализирована (Шаг 2)
2. Проверьте логи в Vercel (должны быть сообщения от DB CLIENT)
3. Проверьте, что `TURSO_DATABASE_URL` и `TURSO_AUTH_TOKEN` правильно скопированы

### Проблема: SMS не отправляется

**Решение:**
1. Проверьте, что `EXPO_PUBLIC_SMS_API_ID` добавлен в Vercel
2. SMS.ru может требовать верификацию аккаунта
3. В демо-режиме код будет выводиться в консоль браузера (F12 → Console)

## Полезные команды

### Просмотр логов Vercel
```bash
vercel logs https://rork-project-review-and-feedback.vercel.app
```

### Проверка базы данных
```bash
turso db shell restaurant-app
SELECT COUNT(*) FROM orders;
```

### Очистка базы данных (если нужно)
```bash
turso db shell restaurant-app
DELETE FROM orders;
```

## Контакты для поддержки

Если проблемы остались, предоставьте:
1. Скриншот страницы Environment Variables в Vercel
2. Логи из консоли браузера (F12 → Console)
3. Логи из Vercel Functions
