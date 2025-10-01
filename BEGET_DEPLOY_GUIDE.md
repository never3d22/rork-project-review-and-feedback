# 🚀 Инструкция по деплою на Beget

## 📋 Данные для подключения

**Приложение:**
- URL: https://roteelonoogu.beget.app/
- Домен: roteelonoogu.beget.app
- IP: 185.207.0.192

**SSH доступ:**
- Имя пользователя: root
- Пароль: i*2ubUF7LOaG

**База данных MySQL:**
- Хост: 193.168.46.179
- Пользователь: user_firdusi
- Пароль: Sow*lmH;&;Z97ND}
- База данных: user_firdusi
- Порт: 3306

**Node.js:**
- Версия: 22.x

## 🔧 Шаги для деплоя

### 1. Подключитесь к серверу по SSH

```bash
ssh root@185.207.0.192
# Введите пароль: i*2ubUF7LOaG
```

### 2. Перейдите в директорию приложения

```bash
cd /home/r/roteelonoogu/roteelonoogu.beget.app
```

### 3. Загрузите файлы проекта

Вы можете использовать один из способов:

**Способ 1: Git (рекомендуется)**
```bash
# Если у вас есть Git репозиторий
git clone ваш_репозиторий .
```

**Способ 2: FTP/SFTP**
- Используйте FileZilla или другой FTP клиент
- Подключитесь к 185.207.0.192
- Загрузите все файлы проекта

**Способ 3: SCP**
```bash
# С вашего локального компьютера
scp -r ./* root@185.207.0.192:/home/r/roteelonoogu/roteelonoogu.beget.app/
```

### 4. Установите зависимости

```bash
# Убедитесь что используется Node.js 22.x
node --version

# Установите зависимости
npm install
```

### 5. Настройте переменные окружения

```bash
# Скопируйте файл с переменными окружения
cp .beget.env .env

# Или создайте .env файл вручную
nano .env
```

Вставьте следующее содержимое:
```
DATABASE_HOST=193.168.46.179
DATABASE_USER=user_firdusi
DATABASE_PASSWORD=Sow*lmH;&;Z97ND}
DATABASE_NAME=user_firdusi
DATABASE_PORT=3306

EXPO_PUBLIC_SMS_API_ID=457A5DBA-D814-BC10-DDD7-645DC659658E

NODE_ENV=production
PORT=3000
```

### 6. Инициализируйте базу данных

```bash
# Подключитесь к MySQL
mysql -h 193.168.46.179 -u user_firdusi -p user_firdusi
# Введите пароль: Sow*lmH;&;Z97ND}

# Выполните SQL скрипт для создания таблиц
source init-mysql-database.sql

# Или выполните команды вручную из файла init-mysql-database.sql
```

### 7. Запустите сервер

```bash
# Запуск в фоновом режиме с PM2 (рекомендуется)
npm install -g pm2
pm2 start beget-server.js --name "roteelonoogu-api"
pm2 save
pm2 startup

# Или простой запуск
npm run beget-start
```

### 8. Проверьте работу API

```bash
# Проверьте что сервер запущен
curl http://localhost:3000/api/trpc/example.hi

# Или откройте в браузере
# https://roteelonoogu.beget.app/api/trpc/example.hi
```

## 🔄 Настройка Nginx (если требуется)

Если нужно настроить проксирование через Nginx:

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📱 Обновление клиентского приложения

После деплоя на Beget, обновите URL API в вашем приложении:

```bash
# В файле .env
EXPO_PUBLIC_RORK_API_BASE_URL=https://roteelonoogu.beget.app
```

## 🔍 Полезные команды

```bash
# Просмотр логов PM2
pm2 logs roteelonoogu-api

# Перезапуск приложения
pm2 restart roteelonoogu-api

# Остановка приложения
pm2 stop roteelonoogu-api

# Статус приложения
pm2 status

# Просмотр процессов Node.js
ps aux | grep node

# Проверка подключения к базе данных
mysql -h 193.168.46.179 -u user_firdusi -p
```

## ⚠️ Важные замечания

1. **Безопасность**: Убедитесь что файл `.env` не доступен публично
2. **SSL**: Beget автоматически настроит SSL сертификат для домена
3. **Порты**: Убедитесь что порт 3000 доступен или используйте другой порт
4. **Логи**: Регулярно проверяйте логи на наличие ошибок
5. **Бэкапы**: Настройте регулярные бэкапы базы данных

## 🆘 Решение проблем

### Проблема: Не удается подключиться к базе данных
```bash
# Проверьте доступность MySQL
telnet 193.168.46.179 3306

# Проверьте права пользователя
mysql -h 193.168.46.179 -u user_firdusi -p
SHOW GRANTS;
```

### Проблема: Приложение не запускается
```bash
# Проверьте логи
pm2 logs roteelonoogu-api --lines 100

# Проверьте переменные окружения
cat .env

# Проверьте версию Node.js
node --version
```

### Проблема: 502 Bad Gateway
```bash
# Убедитесь что приложение запущено
pm2 status

# Проверьте что порт 3000 слушается
netstat -tulpn | grep 3000
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs`
2. Проверьте статус: `pm2 status`
3. Обратитесь в поддержку Beget: https://beget.com/ru/support
