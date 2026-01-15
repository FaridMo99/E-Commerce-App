FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS builder
COPY . .

ARG NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN

ARG NEXT_PUBLIC_CLOUDFLARE_SITE_KEY
ENV NEXT_PUBLIC_CLOUDFLARE_SITE_KEY=$NEXT_PUBLIC_CLOUDFLARE_SITE_KEY

ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL

ARG NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL
ENV NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL=$NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL

ARG NEXT_PUBLIC_DOCKER_ENV
ENV NEXT_PUBLIC_DOCKER_ENV=$NEXT_PUBLIC_DOCKER_ENV

ARG NEXT_PUBLIC_STRIPE_ENV
ENV NEXT_PUBLIC_STRIPE_ENV=$NEXT_PUBLIC_STRIPE_ENV

RUN npm ci
RUN npm run build -w shared
RUN npm run build -w frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

USER nextjs
EXPOSE 10000

CMD ["node", "frontend/server.js"]