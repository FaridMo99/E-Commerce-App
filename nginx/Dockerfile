FROM nginx:alpine

RUN apk add --no-cache openssl

ENV NGINX_PORT=443
ENV FRONTEND_PORT=3000
ENV BACKEND_PORT=3001
ENV FRONTEND_DOCKER_BASE_URL=frontend
ENV BACKEND_DOCKER_BASE_URL=backend

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=US/O=Shoppi/CN=${FRONTEND_DOMAIN}" \
    -addext "subjectAltName = DNS:${FRONTEND_DOMAIN}, DNS:${BACKEND_DOMAIN}"

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 443