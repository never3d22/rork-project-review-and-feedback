-- Создание таблиц для MySQL базы данных на Beget

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  birthday VARCHAR(50),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  addresses TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  `order` INT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица блюд
CREATE TABLE IF NOT EXISTS dishes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  weight VARCHAR(100),
  ingredients TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  user_phone VARCHAR(50),
  items TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  utensils BOOLEAN NOT NULL DEFAULT FALSE,
  utensils_count INT NOT NULL DEFAULT 0,
  payment_method VARCHAR(100) NOT NULL,
  delivery_type VARCHAR(100) NOT NULL,
  delivery_address TEXT,
  delivery_time VARCHAR(100),
  comments TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  cancel_reason TEXT,
  cancelled_at TIMESTAMP NULL,
  payment_status VARCHAR(50),
  payment_id VARCHAR(255),
  payment_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица ресторана
CREATE TABLE IF NOT EXISTS restaurant (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  working_hours VARCHAR(255) NOT NULL,
  delivery_time VARCHAR(255) NOT NULL,
  pickup_time VARCHAR(255) NOT NULL,
  delivery_min_time INT NOT NULL,
  delivery_max_time INT NOT NULL,
  pickup_min_time INT NOT NULL,
  pickup_max_time INT NOT NULL,
  logo TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица SMS кодов
CREATE TABLE IF NOT EXISTS sms_codes (
  id VARCHAR(255) PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка начальных данных для ресторана
INSERT INTO restaurant (id, name, address, phone, working_hours, delivery_time, pickup_time, delivery_min_time, delivery_max_time, pickup_min_time, pickup_max_time, logo, updated_at)
VALUES (
  'default',
  'Фирдуси',
  'г. Москва, ул. Примерная, д. 1',
  '+7 (999) 123-45-67',
  'Пн-Вс: 10:00 - 22:00',
  '30-60 минут',
  '15-30 минут',
  30,
  60,
  15,
  30,
  NULL,
  CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE name=name;

-- Вставка категорий
INSERT INTO categories (id, name, `order`, visible, created_at) VALUES
('salads', 'Салаты', 1, TRUE, CURRENT_TIMESTAMP),
('hot-dishes', 'Горячие блюда', 2, TRUE, CURRENT_TIMESTAMP),
('soups', 'Супы', 3, TRUE, CURRENT_TIMESTAMP),
('desserts', 'Десерты', 4, TRUE, CURRENT_TIMESTAMP),
('drinks', 'Напитки', 5, TRUE, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=name;

-- Вставка примеров блюд
INSERT INTO dishes (id, name, description, price, image, category, available, weight, ingredients, created_at) VALUES
('caesar-salad', 'Цезарь', 'Классический салат с курицей, листьями салата, сыром пармезан и соусом Цезарь', 450.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'salads', TRUE, '250г', 'Курица, салат, пармезан, соус Цезарь', CURRENT_TIMESTAMP),
('greek-salad', 'Греческий салат', 'Свежие овощи с сыром фета и оливками', 380.00, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', 'salads', TRUE, '200г', 'Помидоры, огурцы, фета, оливки', CURRENT_TIMESTAMP),
('beef-steak', 'Стейк из говядины', 'Сочный стейк из мраморной говядины с овощами гриль', 890.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', 'hot-dishes', TRUE, '300г', 'Говядина, овощи гриль', CURRENT_TIMESTAMP),
('chicken-pasta', 'Паста с курицей', 'Паста в сливочном соусе с кусочками курицы', 520.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'hot-dishes', TRUE, '350г', 'Паста, курица, сливки', CURRENT_TIMESTAMP),
('borsch', 'Борщ', 'Традиционный украинский борщ со сметаной', 320.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', 'soups', TRUE, '400мл', 'Свекла, капуста, мясо, сметана', CURRENT_TIMESTAMP),
('tiramisu', 'Тирамису', 'Классический итальянский десерт', 380.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'desserts', TRUE, '150г', 'Маскарпоне, кофе, савоярди', CURRENT_TIMESTAMP),
('cola', 'Кока-Кола', 'Освежающий напиток', 150.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 'drinks', TRUE, '330мл', 'Газированный напиток', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=name;
