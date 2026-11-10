# Static dist is built with VITE_API_URL=/api/v1 before assembling this context.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
