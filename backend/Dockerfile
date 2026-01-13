# --- Stage 1: Dependencies (The "deps" stage) ---
FROM node:20-alpine AS deps
# libc6-compat is required for Prisma and other native modules on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy manifests for the entire monorepo to leverage Docker cache
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
# Prisma schema is needed here to download the correct engine binaries during npm ci
COPY backend/prisma ./backend/prisma/

# Install all dependencies (including devDependencies like typescript/prisma)
RUN npm ci --verbose

# --- Stage 2: Builder (The "build" stage) ---
FROM deps AS builder
WORKDIR /app
# Copy the rest of the source code
COPY . .

# 1. Generate Prisma Client inside the Linux environment
# This ensures the binary match the container OS (linux-musl)
RUN npx prisma generate --schema ./backend/prisma/schema.prisma

# 2. Build the packages in order
RUN npm run build -w shared
RUN npm run build -w backend

# 3. Prune devDependencies to keep the final image small
RUN npm prune --omit=dev

# --- Stage 3: Runner (The "production" stage) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Security: Create and use a non-privileged user
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

# 1. Copy pruned node_modules (production-only + Prisma runtime)
COPY --from=builder /app/node_modules ./node_modules

# 2. Copy the shared package build
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package.json ./shared/package.json

# 3. Copy the backend build artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json

# 4. IMPORTANT: Copy the generated Prisma client into the dist folder
# This ensures that your compiled code in ./dist/app.js can find the client
COPY --from=builder /app/backend/src/generated/prisma ./dist/generated/prisma

# Fix permissions for the non-root user
RUN chown -R nodeuser:nodegroup /app
USER nodeuser

EXPOSE 3001

# Start the application using the compiled code
CMD ["node", "dist/app.js"]