# Настройка переменных окружения в Vercel

## Шаг 1: Откройте настройки проекта
1. Перейдите: https://vercel.com/vitalys-projects-99672749/rork-project-review-and-feedback/settings/environment-variables
2. Или: Ваш проект → Settings → Environment Variables

## Шаг 2: Добавьте переменные окружения

Добавьте следующие переменные для **Production, Preview и Development**:

### 1. TURSO_DATABASE_URL
```
https://restaurant-app-never3d22.aws-eu-west-1.turso.io
```

### 2. TURSO_AUTH_TOKEN
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag
```

### 3. EXPO_PUBLIC_RORK_API_BASE_URL
```
https://rork-project-review-and-feedback.vercel.app
```

### 4. EXPO_PUBLIC_SMS_API_ID
```
457A5DBA-D814-BC10-DDD7-645DC659658E
```

## Шаг 3: Сохраните и передеплойте

После добавления всех переменных:
1. Нажмите "Save"
2. Перейдите в Deployments
3. Найдите последний деплой
4. Нажмите три точки → "Redeploy"
5. Выберите "Use existing Build Cache" → Redeploy

## Важно!

- Используйте **постоянный домен**: `rork-project-review-and-feedback.vercel.app`
- Не используйте временные URL типа `rork-project-review-and-feedback-h4qvtfl1l.vercel.app`
- Все переменные должны быть добавлены для всех окружений (Production, Preview, Development)

## Проверка

После деплоя проверьте:
1. Откройте: https://rork-project-review-and-feedback.vercel.app/api
2. Должно показать: "API is working!"
3. Попробуйте создать заказ в приложении
