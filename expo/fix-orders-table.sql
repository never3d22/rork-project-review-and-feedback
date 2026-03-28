-- Скрипт для исправления таблицы orders в Turso
-- Запустите этот скрипт в Turso CLI или через Vercel Storage Dashboard

-- Шаг 1: Создаем временную таблицу с правильной структурой
CREATE TABLE IF NOT EXISTS orders_new (
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

-- Шаг 2: Копируем данные из старой таблицы в новую
INSERT INTO orders_new 
SELECT * FROM orders;

-- Шаг 3: Удаляем старую таблицу
DROP TABLE orders;

-- Шаг 4: Переименовываем новую таблицу
ALTER TABLE orders_new RENAME TO orders;

-- Проверка
SELECT 'Orders table fixed successfully!' as message;
