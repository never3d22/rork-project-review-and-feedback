# Исправление app.json для сборки APK

## Проблема
В файле `app.json` есть ссылки на несуществующие файлы уведомлений, которые вызывают краш приложения при сборке через EAS Build.

## Решение

Откройте файл `app.json` и найдите секцию с `expo-notifications`:

```json
[
  "expo-notifications",
  {
    "icon": "./local/assets/notification_icon.png",
    "color": "#ffffff",
    "defaultChannel": "default",
    "sounds": [
      "./local/assets/notification_sound.wav"
    ],
    "enableBackgroundRemoteNotifications": false
  }
],
```

Замените её на:

```json
"expo-notifications",
```

## Полная секция plugins должна выглядеть так:

```json
"plugins": [
  [
    "expo-router",
    {
      "origin": "https://rork.com/"
    }
  ],
  [
    "expo-image-picker",
    {
      "photosPermission": "The app accesses your photos to let you share them with your friends."
    }
  ],
  [
    "expo-location",
    {
      "isAndroidForegroundServiceEnabled": true,
      "isAndroidBackgroundLocationEnabled": true,
      "isIosBackgroundLocationEnabled": true,
      "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
    }
  ],
  "expo-notifications",
  [
    "expo-av",
    {
      "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
    }
  ]
],
```

## После исправления

1. Сохраните файл
2. Закоммитьте изменения в git (если используете)
3. Запустите новую сборку через EAS Build

## Что было исправлено в коде

1. ✅ Добавлена обработка ошибок в `store/restaurant-store.ts` для уведомлений
2. ✅ Добавлена обработка ошибок инициализации в `app/_layout.tsx`
3. ✅ Добавлен fallback URL для API в `lib/trpc.ts`
4. ✅ Добавлены логи для отладки

## Проверка после сборки

После установки APK проверьте логи в консоли:
- Должно появиться "App starting..."
- Должен быть виден API Base URL
- Не должно быть ошибок инициализации
