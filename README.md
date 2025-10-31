# Social Backend API

Backend API для социальной сети, построенный на Express.js с TypeScript, Prisma ORM и PostgreSQL.

## 🚀 Быстрый старт

### Предварительные требования
- **Node.js** (версия 18 или выше)
- **npm** или **yarn**
- **PostgreSQL** (версия 14 или выше)
- **Docker** и **Docker Compose** (опционально)

### Установка и настройка

1. **Клонирование репозитория**
```bash
git clone https://github.com/Fr0ntcoder/social-backend.git
cd social-backend

2. **Установка зависимостей** 
$ yarn install

2. **Настройка окружения** 

# Создайте файл .env и добавьте: 

# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/social_db"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma db push

# Режим разработки с hot-reload
yarn dev

# Продакшн режим
yarn start