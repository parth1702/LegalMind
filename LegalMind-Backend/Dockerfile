# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Production image ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy installed packages from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create uploads directory (required by multer middleware)
RUN mkdir -p uploads

EXPOSE 5000

# Health check using your existing /api/health route
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
