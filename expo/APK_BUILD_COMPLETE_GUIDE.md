# Полная инструкция по сборке APK для Android

## Шаг 1: Подготовка проекта (УЖЕ ВЫПОЛНЕНО ✓)

Вы уже выполнили команду:
```bash
bunx expo prebuild --platform android
```

Это создало папку `android/` с нативным Android проектом.

---

## Шаг 2: Открытие проекта в Android Studio

1. **Запустите Android Studio**

2. **Откройте проект:**
   - Нажмите `File` → `Open`
   - Перейдите в папку вашего проекта: `C:\Users\never\Downloads\Firdusi\firdusi`
   - **ВАЖНО:** Выберите папку `android` внутри проекта (не корневую папку!)
   - Путь должен быть: `C:\Users\never\Downloads\Firdusi\firdusi\android`
   - Нажмите `OK`

3. **Дождитесь синхронизации Gradle:**
   - Android Studio автоматически начнет синхронизацию
   - Внизу экрана будет прогресс-бар "Gradle Sync"
   - Это может занять 5-15 минут при первом открытии
   - Дождитесь завершения (появится "Gradle sync finished")

---

## Шаг 3: Сборка APK

### Вариант A: Через меню Android Studio (РЕКОМЕНДУЕТСЯ)

1. **Выберите Build Variant:**
   - Нажмите `Build` → `Select Build Variant`
   - В панели слева выберите `release` (не debug!)

2. **Соберите APK:**
   - Нажмите `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Дождитесь завершения сборки (появится уведомление)

3. **Найдите APK файл:**
   - После сборки появится уведомление внизу справа
   - Нажмите на ссылку `locate` в уведомлении
   - Или найдите файл вручную по пути:
   ```
   C:\Users\never\Downloads\Firdusi\firdusi\android\app\build\outputs\apk\release\app-release.apk
   ```

### Вариант B: Через командную строку

1. **Откройте PowerShell в папке проекта:**
   ```bash
   cd C:\Users\never\Downloads\Firdusi\firdusi
   ```

2. **Перейдите в папку android:**
   ```bash
   cd android
   ```

3. **Соберите APK:**
   - Для Windows:
   ```bash
   .\gradlew.bat assembleRelease
   ```
   
   - Для Mac/Linux:
   ```bash
   ./gradlew assembleRelease
   ```

4. **Найдите APK:**
   ```
   android\app\build\outputs\apk\release\app-release.apk
   ```

---

## Шаг 4: Установка APK на телефон

### Способ 1: Через USB кабель

1. **Включите режим разработчика на телефоне:**
   - Откройте `Настройки` → `О телефоне`
   - Нажмите 7 раз на `Номер сборки`
   - Появится сообщение "Вы стали разработчиком"

2. **Включите отладку по USB:**
   - Откройте `Настройки` → `Для разработчиков`
   - Включите `Отладка по USB`

3. **Подключите телефон к компьютеру:**
   - Подключите USB кабель
   - На телефоне разрешите отладку (появится запрос)

4. **Установите APK:**
   - В Android Studio нажмите `Run` → `Run 'app'`
   - Или через командную строку:
   ```bash
   adb install android\app\build\outputs\apk\release\app-release.apk
   ```

### Способ 2: Через файл (БЕЗ КАБЕЛЯ)

1. **Скопируйте APK файл:**
   - Найдите файл: `android\app\build\outputs\apk\release\app-release.apk`
   - Скопируйте его на телефон любым способом:
     - Через Google Drive
     - Через Telegram (отправьте себе)
     - Через облако (Яндекс.Диск, Dropbox)
     - Через email

2. **Установите на телефоне:**
   - Откройте файл APK на телефоне
   - Разрешите установку из неизвестных источников (если попросит)
   - Нажмите `Установить`

---

## Шаг 5: Отправка APK директору

1. **Переименуйте файл (опционально):**
   ```
   app-release.apk → Firdusi-v1.0.0.apk
   ```

2. **Отправьте файл:**
   - Через Telegram
   - Через Email
   - Через облачное хранилище (Google Drive, Яндекс.Диск)
   - Через файлообменник (WeTransfer, Dropbox)

3. **Инструкция для директора:**
   ```
   1. Скачайте файл Firdusi-v1.0.0.apk на телефон
   2. Откройте файл
   3. Разрешите установку из неизвестных источников (если попросит)
   4. Нажмите "Установить"
   5. Откройте приложение
   ```

---

## Возможные проблемы и решения

### Проблема 1: "Gradle sync failed"

**Решение:**
1. Откройте `File` → `Invalidate Caches` → `Invalidate and Restart`
2. Дождитесь перезапуска Android Studio
3. Попробуйте снова

### Проблема 2: "SDK not found"

**Решение:**
1. Откройте `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
2. Убедитесь, что установлен Android SDK (минимум API 34)
3. Если нет - нажмите `Apply` для установки

### Проблема 3: "Build failed" с ошибкой подписи

**Решение:**
Для тестовой сборки используйте debug версию:
1. `Build` → `Select Build Variant` → выберите `debug`
2. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. APK будет в: `android\app\build\outputs\apk\debug\app-debug.apk`

### Проблема 4: APK не устанавливается на телефон

**Решение:**
1. Убедитесь, что включена установка из неизвестных источников:
   - `Настройки` → `Безопасность` → `Неизвестные источники` (включить)
   - Или для Android 8+: `Настройки` → `Приложения` → `Специальный доступ` → `Установка неизвестных приложений`

2. Если APK поврежден - пересоберите:
   ```bash
   cd android
   .\gradlew.bat clean
   .\gradlew.bat assembleRelease
   ```

---

## Быстрая справка команд

```bash
# Создать нативный проект (уже выполнено)
bunx expo prebuild --platform android

# Собрать APK через Gradle (в папке android)
.\gradlew.bat assembleRelease        # Release версия
.\gradlew.bat assembleDebug          # Debug версия

# Очистить сборку
.\gradlew.bat clean

# Установить APK на подключенный телефон
adb install путь\к\файлу.apk

# Проверить подключенные устройства
adb devices
```

---

## Итоговый чеклист

- [ ] Выполнена команда `bunx expo prebuild --platform android`
- [ ] Открыта папка `android` в Android Studio
- [ ] Завершена синхронизация Gradle
- [ ] Выбран Build Variant: `release`
- [ ] Собран APK через `Build` → `Build APK(s)`
- [ ] Найден файл `app-release.apk`
- [ ] APK скопирован и отправлен директору
- [ ] APK успешно установлен на тестовом телефоне

---

## Следу��щие шаги

После тестирования APK:
1. Соберите подписанный APK для публикации (требуется keystore)
2. Оптимизируйте размер APK (ProGuard, R8)
3. Подготовьте приложение для Google Play Store

Для публикации в Google Play потребуется:
- Подписанный APK с keystore
- Иконки и скриншоты
- Описание приложения
- Политика конфиденциальности
