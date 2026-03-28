-- Инициализация базы данных для ресторанного приложения
-- Запустите этот скрипт в Turso CLI: turso db shell restaurant-app < init-database.sql

-- Таблица пользователей
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

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Таблица блюд
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

-- Таблица заказов
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

-- Таблица информации о ресторане
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

-- Таблица SMS кодов
CREATE TABLE IF NOT EXISTS sms_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Проверка созданных таблиц
SELECT 'Tables created successfully!' as message;
