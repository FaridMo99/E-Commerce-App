FROM nginx:alpine

RUN apk add --no-cache openssl

ENV FRONTEND_DOMAIN=localhost 
ENV BACKEND_DOMAIN=api.localhost
ENV NGINX_PORT=443
ENV FRONTEND_PORT=3000
ENV BACKEND_PORT=3001
ENV FRONTEND_DOCKER_BASE_URL=frontend
ENV BACKEND_DOCKER_BASE_URL=backend

COPY nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template

COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]