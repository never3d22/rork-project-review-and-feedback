# Настройка Vercel с MySQL от Beget

## ✅ Что сделано

1. **Backend переключен на MySQL** - `backend/hono.ts` теперь использует MySQL вместо Turso
2. **Схема базы данных готова** - все таблицы определены в `backend/db/schema.ts`
3. **Локальные переменные настроены** - `.env` файл содержит данные от Beget

## 📋 Что нужно сделать

### 1. Добавить переменные окружения в Vercel

Зайдите в настройки вашего проекта на Vercel:
https://vercel.com/your-username/rork-project-review-and-feedback/settings/environment-variables

Добавьте следующие переменные для **Production, Preview, и Development**:

```
DATABASE_HOST=193.168.46.179
DATABASE_USER=user_firdusi
DATABASE_PASSWORD=Sow*lmH;&;Z97ND}
DATABASE_NAME=user_firdusi
DATABASE_PORT=3306
```

### 2. Удалить старые переменные Turso (если есть)

Удалите эти переменные из Vercel, если они там есть:
- `STORAGE_TURSO_DATABASE_URL`
- `STORAGE_TURSO_AUTH_TOKEN`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### 3. Инициализировать базу данных на Beget

Выполните SQL скрипт для создания таблиц. Используйте файл `init-mysql-database.sql`:

**Способ 1: Через phpMyAdmin на Beget**
1. Войдите в phpMyAdmin на Beget
2. Выберите базу данных `user_firdusi`
3. Перейдите на вкладку "SQL"
4. Скопируйте содержимое файла `init-mysql-database.sql`
5. Вставьте и выполните

**Способ 2: Через MySQL клиент**
```bash
mysql -h 193.168.46.179 -u user_firdusi -p user_firdusi < init-mysql-database.sql
```

### 4. Заполнить базу тестовыми данными (опционально)

Если хотите добавить тестовые данные, выполните `seed-database.sql` таким же способом.

### 5. Redeploy на Vercel

После добавления переменных окружения:
1. Зайдите в Deployments
2. Найдите последний деплой
3. Нажмите три точки → "Redeploy"
4. Или просто сделайте новый commit и push

## 🔍 Проверка работы

После деплоя проверьте:

1. **Health check**: https://rork-project-review-and-feedback.vercel.app/api/
   - Должен вернуть: `{"status":"ok","message":"API is working!"}`

2. **Создание заказа**: Попробуйте оформить заказ в приложении
   - Заказ должен сохраниться в базу MySQL на Beget

3. **Логи Vercel**: Проверьте логи на наличие ошибок подключения к БД

## ❓ Возможные проблемы

### Ошибка подключения к MySQL

Если видите ошибку "Can't connect to MySQL server":
1. Проверьте, что IP адрес Vercel разрешен в настройках MySQL на Beget
2. Beget может требовать добавления IP адресов Vercel в whitelist
3. Свяжитесь с поддержкой Beget для разрешения внешних подключений

### Таблицы не созданы

Если видите ошибку "Table doesn't exist":
1. Убедитесь, что выполнили `init-mysql-database.sql`
2. Проверьте, что используете правильную базу данных `user_firdusi`

## 🚀 Размещение на Beget (альтернатива Vercel)

Если хотите разместить **всё приложение** на Beget:

### Требования:
- Node.js 18+ на хостинге
- Возможность запуска Node.js приложений
- SSH доступ

### Проверьте у Beget:
1. Поддерживает ли ваш тариф Node.js приложения
2. Какая версия Node.js доступна
3. Как настроить запуск Node.js сервера

**Примечание**: Обычно Beget предназначен для PHP/MySQL хостинга. Для Node.js приложений лучше использовать:
- Vercel (текущий вариант) - бесплатно
- Railway.app - бесплатный тариф
- Render.com - бесплатный тариф
- DigitalOcean App Platform

## 📝 Текущая архитектура

```
Frontend (Expo/React Native)
    ↓
Vercel (Hono + tRPC Backend)
    ↓
MySQL на Beget
```

Это оптимальная схема:
- Frontend и Backend на Vercel (бесплатно, быстро)
- База данных на Beget (у вас уже есть)
