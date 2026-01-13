FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json

RUN npm ci --verbose



FROM deps AS builder

WORKDIR /app

COPY . .

RUN npm run build -w shared
RUN npm run build -w backend



FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=prod

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup


COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/src/generated ./dist/generated
COPY --from=builder /app/backend/prisma ./prisma

RUN chown -R nodeuser:nodegroup /app
USER nodeuser

EXPOSE 3001

CMD ["npm", "run", "start"]