# Исправление таблицы orders в Vercel/Turso

## Проблема
В вашей базе данных колонка `status` имеет неправильное DEFAULT значение `''pending''` (с двойными кавычками), что может вызывать ошибки при вставке данных.

## Решение

### Вариант 1: Через Vercel Dashboard (Рекомендуется)

1. Откройте Vercel Dashboard: https://vercel.com/vitalys-projects-99672749/rork-project-review-and-feedback
2. Перейдите в раздел **Storage**
3. Выберите вашу базу данных **restaurant-app-never3d22**
4. Откройте **SQL Console**
5. Скопируйте и выполните содержимое файла `fix-orders-table.sql`:

```sql
-- Создаем временную таблицу с правильной структурой
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

-- Копируем данные из старой таблицы в новую
INSERT INTO orders_new 
SELECT * FROM orders;

-- Удаляем старую таблицу
DROP TABLE orders;

-- Переименовываем новую таблицу
ALTER TABLE orders_new RENAME TO orders;
```

### Вариант 2: Через Turso CLI

Если у вас установлен Turso CLI:

```bash
turso db shell restaurant-app-never3d22 < fix-orders-table.sql
```

## Проверка

После выполнения скрипта проверьте структуру таблицы:

```sql
PRAGMA table_info(orders);
```

Колонка `status` должна иметь DEFAULT значение `'pending'` (без двойных кавычек).

## Что было исправлено

1. ✅ Убран health check, который вызывал зависание
2. ✅ Создан SQL скрипт для исправления структуры таблицы orders
3. ✅ Упрощен процесс создания заказа

## Тестирование

После исправления попробуйте создать заказ через приложение. Вы должны увидеть в консоли:

```
🔵 [CLIENT] Starting order creation
📝 [CLIENT] Preparing tRPC mutation...
📝 [CLIENT] Calling tRPC mutation...
✅ [CLIENT] Order saved to database successfully!
```

## Дополнительная информация

- База данных: `restaurant-app-never3d22.aws-eu-west-1.turso.io`
- Vercel URL: `https://rork-project-review-and-feedback.vercel.app`
- API URL: `https://rork-project-review-and-feedback.vercel.app/api`
