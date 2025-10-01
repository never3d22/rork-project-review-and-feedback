# 🚀 Быстрая настройка Vercel

## ✅ Что нужно сделать

### 1. Добавить переменные окружения в Vercel

Зайдите: **Settings → Environment Variables**

Добавьте эти 4 переменные для **всех окружений** (Production, Preview, Development):

| Название | Значение | Где взять |
|----------|----------|-----------|
| `TURSO_DATABASE_URL` | `libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io` | У вас уже есть ✅ |
| `TURSO_AUTH_TOKEN` | `eyJhbGci...` (длинный токен) | У вас уже есть ✅ |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | `https://ваш-домен.vercel.app` | **Ваш production URL!** |
| `EXPO_PUBLIC_SMS_API_ID` | `457A5DBA-D814-BC10-DDD7-645DC659658E` | У вас уже есть ✅ |

### 2. Найти ваш production URL

Ваш production URL - это адрес вашего приложения на Vercel.

Например:
- `https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app`
- или ваш кастомный домен

**Где найти:**
1. Откройте ваш проект на Vercel
2. Вверху страницы будет кнопка **Visit** - это и есть ваш URL
3. Или посмотрите в разделе **Deployments** → последний деплой → **Domains**

### 3. Сделать Redeploy

**ВАЖНО!** После добавления переменных:

1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите на три точки **⋯** справа
4. Выберите **Redeploy**
5. Подтвердите

## 🔍 Проверка

После redeploy откройте:
```
https://ваш-домен.vercel.app/api
```

Должно показать:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

Если видите это - всё работает! ✅

## 📝 Что я исправил в коде

1. ✅ Добавил детальные логи в консоль браузера
2. ✅ Улучшил обработку ошибок
3. ✅ Теперь вы будете видеть точную причину ошибки

## 🐛 Если не работает

Откройте консоль браузера (F12) и посмотрите логи:
- `[TRPC CLIENT] Getting base URL` - покажет какой URL используется
- `[TRPC] Making request` - покажет детали запроса
- `[TRPC] Response received` - покажет ответ сервера

Скопируйте логи и отправьте мне - я помогу разобраться!

## 📸 Пример настройки в Vercel

Должно выглядеть так:

```
✅ TURSO_DATABASE_URL          [All Environments]
✅ TURSO_AUTH_TOKEN             [All Environments]
✅ EXPO_PUBLIC_RORK_API_BASE_URL [All Environments]
✅ EXPO_PUBLIC_SMS_API_ID       [All Environments]
```

Каждая переменная должна быть отмечена зелёной галочкой ✅
