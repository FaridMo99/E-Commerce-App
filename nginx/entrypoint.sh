#!/bin/sh

mkdir -p /etc/nginx/ssl

echo "$SSL_CERT" > /etc/nginx/ssl/server.crt
echo "$SSL_KEY" > /etc/nginx/ssl/server.key

envsubst '${FRONTEND_DOMAIN} ${BACKEND_DOMAIN} ${NGINX_PORT} ${FRONTEND_PORT} ${BACKEND_PORT} ${FRONTEND_DOCKER_BASE_URL} ${BACKEND_DOCKER_BASE_URL}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'