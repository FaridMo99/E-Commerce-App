#!/bin/sh

mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=US/O=Shoppi/CN=${FRONTEND_DOMAIN}" \
    -addext "subjectAltName = DNS:${FRONTEND_DOMAIN}, DNS:${BACKEND_DOMAIN}"

envsubst '${FRONTEND_DOMAIN} ${BACKEND_DOMAIN} ${NGINX_PORT} ${FRONTEND_PORT} ${BACKEND_PORT} ${FRONTEND_DOCKER_BASE_URL} ${BACKEND_DOCKER_BASE_URL}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'