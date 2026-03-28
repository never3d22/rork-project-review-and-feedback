# ⚡ Быстрый старт на Beget

## 🎯 Что нужно сделать

### 1️⃣ Подключитесь к серверу
```bash
ssh root@185.207.0.192
# Пароль: i*2ubUF7LOaG
```

### 2️⃣ Перейдите в директорию
```bash
cd /home/r/roteelonoogu/roteelonoogu.beget.app
```

### 3️⃣ Загрузите файлы проекта
Используйте FTP (FileZilla) или SCP:
```bash
# С вашего компьютера
scp -r ./* root@185.207.0.192:/home/r/roteelonoogu/roteelonoogu.beget.app/
```

### 4️⃣ Установите зависимости
```bash
npm install
npm install -g pm2
```

### 5️⃣ Создайте .env файл
```bash
nano .env
```

Вставьте:
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

Сохраните: `Ctrl+X`, затем `Y`, затем `Enter`

### 6️⃣ Инициализируйте базу данных
```bash
mysql -h 193.168.46.179 -u user_firdusi -p user_firdusi < init-mysql-database.sql
# Пароль: Sow*lmH;&;Z97ND}
```

### 7️⃣ Запустите сервер
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8️⃣ Проверьте работу
```bash
pm2 status
pm2 logs
```

Откройте в браузере: https://roteelonoogu.beget.app/api/trpc/example.hi

## ✅ Готово!

Теперь обновите URL в вашем приложении:
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://roteelonoogu.beget.app
```

## 🔄 Полезные команды

```bash
pm2 restart roteelonoogu-api  # Перезапуск
pm2 logs roteelonoogu-api     # Логи
pm2 stop roteelonoogu-api     # Остановка
pm2 status                     # Статус
```
