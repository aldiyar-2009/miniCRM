# Project Review: miniCRM Week 1

## Цель
Сравнить текущую реализацию проекта с требованиями первой недели и выделить, что уже сделано, что нужно добавить, а что относится ко второй неделе и должно быть убрано.

---

## Что уже реализовано

### Архитектура
- `src/routes/*`
- `src/controllers/*`
- `src/services/*`
- `src/repositories/*`

### Конфигурация
- `.env` файл есть
- `dotenv` подключён
- `src/config/config.js`
- `src/config/token.js`

### Централизованная обработка ошибок
- `AppError.js`
- `src/middleware/errorHandler.js`

### Валидация
- `src/middleware/validate.js` на `Joi`

### Безопасность и логирование
- `helmet`
- `express-rate-limit`
- `morgan`
- `cors` с whitelist

### SQL/CRM
- `knexfile.js`
- миграции:
  - `users`
  - `companies`
  - `contacts`
  - `deals`
  - `deal_stage_history`
- `contacts.company_id` FK
- `deals.company_id` FK
- `deals.owner_id` FK

### Аутентификация
- `src/middleware/auth.js`
- `src/middleware/role.js`
- `src/services/userService.js` генерирует access + refresh токены

### API документация
- `src/swagger.js`
- `src/swagger_output.json`
- `src/app.js` подключает `swagger-ui-express`

### Фронтенд
- `public/js/api.js` — обёртка над `$.ajax`
- `$.ajaxSetup` добавляет `Authorization`
- есть `public/js/auth.js`, `companies.js`, `contacts.js`
- страницы `public/html/login.html` и `admin.html`

### Тестирование
- `package.json` содержит `jest`, `supertest`, `test`, `test:watch`, `test:coverage`
- есть тестовый файл `src/routes/__test__/company.test.js`

---

## Что надо добавить / исправить для завершения первой недели

### 1. ESLint и Prettier
В `package.json` нет:
- `eslint`
- `prettier`
- `eslint-config-prettier`
- `eslint-plugin-prettier`

Нужно создать:
- `.eslintrc` или `.eslintrc.json`
- `.prettierrc`
- `.prettierignore`

### 2. `bcrypt`
В `package.json` есть `bcrypt` и `bcryptjs`, но код сейчас использует PostgreSQL `crypt()`:
- `src/repositories/userRepositories.js`

Если работаете по плану, замените хеширование на `bcrypt`.
Если нет — удалите `bcrypt` / `bcryptjs` из зависимостей.

### 3. Refresh token flow
Пока отсутствует endpoint для обновления токена.
Нужно добавить:
- `POST /users/refresh`
- контроллер + сервис для нового access token

### 4. Защита пользовательских маршрутов
В `src/routes/userRoutes.js` нет `auth`/`role` для CRUD-пользователей.
Если требуется RBAC, нужно обернуть маршруты защитой.

### 5. Фронтенд для загрузки файлов и прогресса
На бэкенде есть `/upload` и `/download/:filename`, но фронтенд:
- не реализует `FormData`
- не отображает прогресс загрузки

Для полной первой недели нужно добавить страницу/скрипт загрузки.

### 6. Удалить лишнее из первой недели
Чтобы проект соответствовал только первой неделе, нужно убрать или не использовать:
- `bullmq` из `package.json`
- `REDIS_*` переменные из `.env`
- `SMTP_*` переменные из `.env`, если почту не используете
- любые файлы или пакеты, связанные с Redis, Socket.IO или cron

---

## Файлы, которые стоит править

### Backend
- `package.json`
- `.env`
- `src/app.js`
- `src/config/config.js`
- `src/config/token.js`
- `src/middleware/auth.js`
- `src/middleware/role.js`
- `src/middleware/validate.js`
- `src/middleware/errorHandler.js`
- `AppError.js`
- `src/routes/userRoutes.js`
- `src/controllers/userController.js`
- `src/services/userService.js`
- `src/repositories/userRepositories.js`
- `src/database/knexfile.js`
- `src/database/db.js`
- `src/database/migrations/*`
- `src/swagger.js`

### Frontend
- `public/html/login.html`
- `public/html/admin.html`
- `public/js/api.js`
- `public/js/auth.js`
- `public/js/errors.js`
- `public/js/companies.js`
- `public/js/contacts.js`
- новый файл для загрузки файлов, если нужен

---

## Что изучить

### Первая неделя
- Express middleware и порядок `app.use`
- JWT auth + access/refresh token pattern
- RBAC
- Joi validation
- Knex + миграции
- SQL foreign keys и JOIN
- Multer upload + static files
- Swagger/OpenAPI
- jQuery AJAX, `.fail()`, обработка ошибок
- ESLint + Prettier
- Rate limiting + Helmet + CORS

### Что не нужно пока
- `Socket.IO`
- `BullMQ` / очереди
- `Redis`
- `node-cron`
- WebSocket realtime
- Mongo/Mongoose

---

## Резюме

Проект уже близок к первой неделе и имеет большую часть требований, но нуждается в:
- настройке ESLint/Prettier,
- реализации refresh token endpoint,
- проверке и защите пользовательских роутов,
- фронтенд-странице для загрузки файлов,
- очистке зависимостей от пакетов второй недели.
