FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate --schema ./backend/prisma/schema.prisma
RUN npm run build -w shared
RUN npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/backend/package.json ./backend/package.json

RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force \
    && chown -R nodeuser:nodegroup /app

COPY --chown=nodeuser:nodegroup --from=builder /app/backend/dist ./dist
COPY --chown=nodeuser:nodegroup --from=builder /app/shared/dist ./shared/dist
COPY --chown=nodeuser:nodegroup --from=builder /app/backend/src/generated/prisma ./dist/generated/prisma
COPY --chown=nodeuser:nodegroup --from=builder /app/backend/prisma ./prisma

USER nodeuser
EXPOSE 3001

CMD npx prisma migrate deploy --schema ./prisma/schema.prisma && node dist/app.js