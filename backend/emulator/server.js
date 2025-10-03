const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const path = require('path');
const fs = require('fs');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';
const ADMIN_TOKEN = 'admin-token';

const users = [
  {
    id: 'user-1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    role: 'Менеджер',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Мария Смирнова',
    email: 'maria@example.com',
    role: 'Оператор',
    createdAt: '2024-02-02',
  },
  {
    id: 'user-3',
    name: 'Алексей Кузнецов',
    email: 'alexey@example.com',
    role: 'Курьер',
    createdAt: '2024-02-20',
  },
];

const app = new Hono();

const indexHtmlPath = path.join(__dirname, 'public', 'index.html');
let cachedIndexHtml = null;

function loadIndexHtml() {
  if (cachedIndexHtml) {
    return cachedIndexHtml;
  }

  try {
    cachedIndexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  } catch (error) {
    console.error('Не удалось прочитать backend/emulator/public/index.html:', error);
    cachedIndexHtml = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Эмулятор</title></head><body><h1>Не удалось загрузить интерфейс</h1><p>Проверьте наличие файла public/index.html</p></body></html>';
  }

  return cachedIndexHtml;
}

app.get('/', (c) => {
  return c.html(loadIndexHtml());
});

app.get('/index.html', (c) => {
  return c.html(loadIndexHtml());
});

app.post('/api/trpc/auth.loginAdmin', async (c) => {
  try {
    const body = await c.req.json();
    const input = body?.[0]?.json ?? body?.input ?? {};
    const { username, password } = input;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return c.json({
        0: {
          result: {
            data: {
              success: true,
              token: ADMIN_TOKEN,
              user: {
                id: 'admin',
                name: 'Администратор',
                email: 'admin@restaurant.com',
                isAdmin: true,
              },
            },
          },
        },
      });
    }

    return c.json({
      0: {
        result: {
          data: {
            success: false,
            error: 'Неверный логин или пароль',
          },
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при обработке входа администратора:', error);
    return c.json(
      {
        0: {
          error: {
            code: 'BAD_REQUEST',
            message: 'Некорректный запрос',
          },
        },
      },
      400,
    );
  }
});

app.post('/api/trpc/users.list', async (c) => {
  const authorization = c.req.header('authorization') ?? '';
  const token = authorization.replace(/^Bearer\s+/i, '');

  if (token !== ADMIN_TOKEN) {
    return c.json(
      {
        0: {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Требуется действительный токен администратора',
          },
        },
      },
      401,
    );
  }

  return c.json({
    0: {
      result: {
        data: {
          users,
        },
      },
    },
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Эмулятор запущен: http://localhost:${port}`);
