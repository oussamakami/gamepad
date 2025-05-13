FROM node:23-alpine

WORKDIR /www

COPY config /www
COPY source /www/source

RUN apk add --update --no-cache openssl && mkdir /www/ssl && \
    openssl genrsa --out /www/ssl/ssl.key 2048 && \
    openssl req -batch -new -key /www/ssl/ssl.key -out /www/ssl/ssl.csr && \
    openssl x509 -req -days 3650 -in /www/ssl/ssl.csr \
    -signkey /www/ssl/ssl.key -out /www/ssl/ssl.crt && \
    npm install && chmod +x launch.sh

ENTRYPOINT ["./launch.sh"]