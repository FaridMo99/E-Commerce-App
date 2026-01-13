FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared ./packages/shared
COPY frontend/package.json ./frontend/

RUN npm ci --verbose

FROM base AS builder
WORKDIR /app
COPY . .

ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL
ARG NEXT_PUBLIC_DOCKER_ENV

ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL=$NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL
ENV NEXT_PUBLIC_DOCKER_ENV=$NEXT_PUBLIC_DOCKER_ENV

RUN npm run build -w shared
RUN npm run build -w frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]