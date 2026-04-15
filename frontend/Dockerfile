FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY shared/package.json ./shared/package.json
COPY frontend/package.json ./frontend/package.json

ARG NEXT_PUBLIC_STRIPE_ENV
ENV NEXT_PUBLIC_STRIPE_ENV=$NEXT_PUBLIC_STRIPE_ENV

RUN npm ci

FROM deps AS tester
COPY . .

RUN npm run build -w shared
RUN npm run lint -w frontend
RUN npm run test -w frontend  

FROM tester AS builder
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_DOCKER_ENV
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_DOMAIN_NAME
ARG BACKEND_DOCKER_INTERNAL_URL
ARG NEXT_PUBLIC_STRIPE_ENV
ARG NEXT_PUBLIC_CLOUDFLARE_SITE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY


ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL \
    NEXT_PUBLIC_DOCKER_ENV=$NEXT_PUBLIC_DOCKER_ENV \
    NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_DOMAIN_NAME=$NEXT_PUBLIC_DOMAIN_NAME \
    BACKEND_DOCKER_INTERNAL_URL=$BACKEND_DOCKER_INTERNAL_URL \
    NEXT_PUBLIC_STRIPE_ENV=$NEXT_PUBLIC_STRIPE_ENV \
    NEXT_PUBLIC_CLOUDFLARE_SITE_KEY=$NEXT_PUBLIC_CLOUDFLARE_SITE_KEY \
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY
    
RUN npm run build -w frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV BACKEND_DOCKER_INTERNAL_URL=http://localhost:3001
ENV NEXT_PUBLIC_DOCKER_ENV=true
ENV NEXT_PUBLIC_STRIPE_ENV=testing
ENV ENV=production

 
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

USER nextjs
EXPOSE 3000
CMD ["node", "frontend/server.js"]