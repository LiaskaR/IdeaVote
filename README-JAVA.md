# IdeaHub - Java Backend с Keycloak

Переход от Node.js к Java Spring Boot с Keycloak авторизацией.

## Архитектура

### Backend (Java)
- **Spring Boot 3.2.1** с Java 21
- **Spring Data JPA** для работы с PostgreSQL
- **Spring Security** интеграция с Keycloak
- **Keycloak 23.0.4** для авторизации и аутентификации
- **PostgreSQL** база данных
- **Maven** для управления зависимостями

### Frontend (React)
- **React 18** с TypeScript
- **Keycloak JS Client** для аутентификации
- **TanStack Query** для работы с API
- **Tailwind CSS** для стилизации

## Быстрый старт

### 1. Запуск инфраструктуры

```bash
# Запуск PostgreSQL и Keycloak
docker-compose up -d postgres keycloak

# Ожидание запуска Keycloak (обычно 2-3 минуты)
docker-compose logs -f keycloak
```

### 2. Настройка Keycloak

1. Открыть админ панель: http://localhost:8180
2. Войти как `admin:admin123`
3. Создать realm "ideahub"
4. Создать клиент "ideahub-frontend" (Public)
5. Создать клиент "ideahub-backend" (Confidential)
6. Настроить Redirect URIs для frontend клиента: `http://localhost:5000/*`

### 3. Запуск Java Backend

```bash
cd backend

# Установка зависимостей и сборка
mvn clean install

# Запуск приложения
mvn spring-boot:run

# Или через Docker
cd ..
docker-compose up backend
```

Backend будет доступен на: http://localhost:8080/api

### 4. Запуск React Frontend

```bash
# Frontend уже настроен для работы с Java API
npm run dev
```

Frontend будет доступен на: http://localhost:5000

## API Endpoints

### Публичные
- `GET /api/health` - Проверка состояния
- `GET /api/stats` - Статистика платформы
- `GET /api/ideas` - Список идей
- `GET /api/ideas/{id}` - Детали идеи
- `GET /api/ideas/{id}/comments` - Комментарии к идее

### Защищённые (требуют авторизации)
- `POST /api/ideas` - Создание идеи
- `PUT /api/ideas/{id}` - Обновление идеи
- `DELETE /api/ideas/{id}` - Удаление идеи
- `POST /api/ideas/{id}/vote` - Голосование
- `DELETE /api/ideas/{id}/vote` - Отмена голоса
- `POST /api/ideas/{id}/comments` - Добавление комментария
- `DELETE /api/comments/{id}` - Удаление комментария
- `GET /api/user/me` - Информация о пользователе

## Переменные окружения

### Backend
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/ideahub
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=ideahub
KEYCLOAK_CLIENT_ID=ideahub-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:5000
```

### Frontend
```bash
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=ideahub
VITE_KEYCLOAK_CLIENT_ID=ideahub-frontend
VITE_API_URL=http://localhost:8080/api
```

## Модели данных

### User
- id (String) - Keycloak User ID
- username, email, firstName, lastName
- profileImageUrl, lastLogin
- createdAt, updatedAt

### Idea
- id (Long), title, description
- imageUrls (String[]), tags (String[])
- author (User), createdAt, updatedAt

### Vote
- id (Long), idea (Idea), user (User)
- type (UP/DOWN), createdAt

### Comment
- id (Long), idea (Idea), author (User)
- content, createdAt, updatedAt

## Безопасность

- **Keycloak JWT токены** для аутентификации
- **CORS** настроен для фронтенда
- **Валидация данных** на уровне DTO
- **Авторизация методов** через Spring Security
- **Автоматическое обновление токенов** в клиенте

## Отличия от Node.js версии

1. **Аутентификация**: JWT через Keycloak вместо локальной
2. **База данных**: JPA/Hibernate вместо Drizzle ORM
3. **API**: Spring Boot REST вместо Express
4. **Безопасность**: Spring Security + Keycloak вместо bcrypt
5. **Типизация**: Java статическая типизация вместо TypeScript

## Разработка

### Тестирование API
```bash
# Проверка здоровья
curl http://localhost:8080/api/health

# Получение токена от Keycloak и использование в запросах
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/user/me
```

### Логи
```bash
# Backend логи
docker-compose logs -f backend

# Keycloak логи
docker-compose logs -f keycloak
```