-- Заполнение таблицы categories
INSERT INTO categories (id, name, "order", visible, created_at) VALUES
('1', 'Салаты', 1, 1, unixepoch()),
('2', 'Супы', 2, 1, unixepoch()),
('3', 'Горячие блюда', 3, 1, unixepoch()),
('4', 'Пицца', 4, 1, unixepoch()),
('5', 'Роллы', 5, 1, unixepoch()),
('6', 'Бургеры', 6, 1, unixepoch()),
('7', 'Десерты', 7, 1, unixepoch()),
('8', 'Напитки', 8, 1, unixepoch()),
('9', 'Закуски', 9, 1, unixepoch());

-- Заполнение таблицы dishes
INSERT INTO dishes (id, name, description, price, image, category, available, weight, ingredients, created_at) VALUES
('1', 'Цезарь с курицей', 'Классический салат с курицей, пармезаном и соусом цезарь', 450, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Салаты', 1, '250г', '["Куриная грудка","Салат романо","Пармезан","Соус цезарь","Сухарики"]', unixepoch()),
('2', 'Греческий салат', 'Свежие овощи, фета, оливки и оливковое масло', 380, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 'Салаты', 1, '200г', '["Помидоры","Огурцы","Сыр фета","Оливки","Красный лук","Оливковое масло"]', unixepoch()),
('3', 'Борщ украинский', 'Традиционный борщ со сметаной и зеленью', 320, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Супы', 1, NULL, NULL, unixepoch()),
('4', 'Солянка мясная', 'Сытный суп с мясом, колбасой и солеными огурцами', 380, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', 'Супы', 1, NULL, NULL, unixepoch()),
('5', 'Стейк из говядины', 'Сочный стейк средней прожарки с гарниром', 890, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'Горячие блюда', 1, NULL, NULL, unixepoch()),
('6', 'Паста карбонара', 'Классическая итальянская паста с беконом и сыром', 520, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', 'Горячие блюда', 1, NULL, NULL, unixepoch()),
('7', 'Тирамису', 'Нежный итальянский десерт с кофе и маскарпоне', 280, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'Десерты', 1, NULL, NULL, unixepoch()),
('8', 'Чизкейк нью-йорк', 'Классический американский чизкейк с ягодами', 320, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', 'Десерты', 1, NULL, NULL, unixepoch()),
('9', 'Кофе американо', 'Классический черный кофе', 150, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'Напитки', 1, NULL, NULL, unixepoch()),
('10', 'Капучино', 'Кофе с молочной пенкой', 180, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Напитки', 1, NULL, NULL, unixepoch()),
('11', 'Пицца Маргарита', 'Классическая пицца с томатами, моцареллой и базиликом', 650, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'Пицца', 1, '450г', '["Тесто","Томатный соус","Моцарелла","Базилик","Оливковое масло"]', unixepoch()),
('12', 'Пицца Пепперони', 'Пицца с острой колбасой пепперони и сыром', 720, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'Пицца', 1, NULL, NULL, unixepoch()),
('13', 'Филадельфия', 'Ролл с лососем, огурцом и сливочным сыром', 420, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', 'Роллы', 1, NULL, NULL, unixepoch()),
('14', 'Калифорния', 'Ролл с крабом, авокадо и икрой тобико', 380, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', 'Роллы', 1, NULL, NULL, unixepoch()),
('15', 'Чизбургер', 'Сочная котлета из говядины с сыром и овощами', 450, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Бургеры', 1, '320г', '["Булочка","Котлета говяжья","Сыр чеддер","Помидор","Салат","Соус"]', unixepoch()),
('16', 'Бургер с беконом', 'Двойная котлета с беконом, сыром и соусом барбекю', 520, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', 'Бургеры', 1, NULL, NULL, unixepoch()),
('17', 'Куриные крылышки', 'Острые куриные крылышки в соусе барбекю', 320, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', 'Закуски', 1, NULL, NULL, unixepoch()),
('18', 'Картофель фри', 'Хрустящий картофель фри с соусом', 180, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 'Закуски', 1, NULL, NULL, unixepoch());

-- Заполнение таблицы restaurant
INSERT INTO restaurant (id, name, address, phone, working_hours, delivery_time, pickup_time, delivery_min_time, delivery_max_time, pickup_min_time, pickup_max_time, logo, updated_at) VALUES
('1', 'Вкусная еда', 'ул. Пушкина, д. 10', '+7 (999) 123-45-67', '10:00 - 23:00', '30-60 минут', '15-30 минут', 30, 60, 15, 30, NULL, unixepoch());
