FROM nginx:alpine

# Install Python
RUN apk add --no-cache python3 py3-pip
WORKDIR /app
COPY ./build/backend /app
COPY ./build/frontend /etc/nginx/html
COPY ./scripts/nginx.conf /etc/nginx/nginx.conf
COPY ./scripts/99-launch-backend.sh /docker-entrypoint.d/
RUN python3 -m pip install -r /app/requirements.txt