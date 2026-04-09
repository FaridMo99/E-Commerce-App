FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY shared/package.json ./shared/package.json
COPY frontend/package.json ./frontend/package.json

RUN npm ci

FROM deps AS tester
COPY . .
RUN npm run lint -w frontend
RUN npx tsc --noEmit
RUN npm run test -w frontend  

FROM tester AS builder
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_DOCKER_ENV
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_DOMAIN_NAME


ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL \
    NEXT_PUBLIC_DOCKER_ENV=$NEXT_PUBLIC_DOCKER_ENV \
    NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_DOMAIN_NAME=$NEXT_PUBLIC_DOMAIN_NAME

RUN npm run build -w shared
RUN npm run build -w frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]