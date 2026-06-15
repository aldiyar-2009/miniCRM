# ── Stage 1: зависимости ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
# Устанавливаем только prod-зависимости
RUN npm ci --omit=dev

# ── Stage 2: финальный образ ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Нужен для bcrypt и нативных модулей
RUN apk add --no-cache python3 make g++

# Копируем зависимости из первого этапа
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходники
COPY . .

# Папка для логов
RUN mkdir -p logs

# Порт приложения (Railway/Render сами его пробрасывают)
EXPOSE 3000

# Сначала запускаем миграции, потом сервер
CMD ["sh", "-c", "npm run migrate && node server.js"]
