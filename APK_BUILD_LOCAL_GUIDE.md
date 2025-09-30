# Инструкция по созданию APK файла локально

## Требования
- Node.js (v18 или выше)
- Bun (или npm/yarn)
- Android Studio с установленным Android SDK
- JDK 17 или выше

## Шаг 1: Установка зависимостей

```bash
# Клонируйте репозиторий
git clone <ваш-репозиторий>
cd <папка-проекта>

# Установите зависимости
bun install
# или
npm install
```

## Шаг 2: Настройка Android окружения

1. Откройте Android Studio
2. Перейдите в Settings → Appearance & Behavior → System Settings → Android SDK
3. Убедитесь, что установлены:
   - Android SDK Platform 34 (или выше)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

4. Добавьте переменные окружения (если еще не добавлены):

**Windows:**
```
ANDROID_HOME=C:\Users\ВашеИмя\AppData\Local\Android\Sdk
```

**macOS/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Шаг 3: Prebuild (генерация нативных папок)

```bash
bunx expo prebuild --platform android --clean
```

Эта команда создаст папку `android/` с нативным Android проектом.

## Шаг 4: Сборка APK

### Вариант A: Debug APK (для тестирования)

```bash
cd android
./gradlew assembleDebug
```

APK будет находиться в:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Вариант B: Release APK (для продакшена)

1. Создайте keystore (если еще нет):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Создайте файл `android/gradle.properties` и добавьте:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=ваш-пароль
MYAPP_RELEASE_KEY_PASSWORD=ваш-пароль
```

3. Отредактируйте `android/app/build.gradle`, добавьте в блок `android`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

4. Соберите release APK:

```bash
cd android
./gradlew assembleRelease
```

APK будет находиться в:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Шаг 5: Установка на устройство

### Через USB:
1. Включите "Режим разработчика" на Android устройстве
2. Включите "Отладка по USB"
3. Подключите устройство к компьютеру
4. Выполните:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Через файл:
Просто скопируйте APK файл на устройство и откройте его для установки.

## Возможные проблемы

### Ошибка: "SDK location not found"
Убедитесь, что переменная `ANDROID_HOME` установлена правильно.

### Ошибка: "Gradle build failed"
Попробуйте:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Ошибка: "Command not found: gradlew"
На Windows используйте:
```bash
gradlew.bat assembleDebug
```

## Быстрая команда (все в одном)

```bash
# Из корневой папки проекта
bun install
bunx expo prebuild --platform android --clean
cd android && ./gradlew assembleDebug
```

APK будет готов в `android/app/build/outputs/apk/debug/app-debug.apk`

## Отправка директору

После сборки просто отправьте файл `app-debug.apk` или `app-release.apk` директору. Он сможет установить его на свой телефон, открыв файл.

**Важно:** Для установки APK на телефоне должна быть включена опция "Установка из неизвестных источников" в настройках безопасности.
