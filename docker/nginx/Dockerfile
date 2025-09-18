# ------------------------------
# Stage 1: Build Front-End
# ------------------------------
FROM node:22-alpine3.21 AS builder

# Metadata labels for the image
LABEL stage="builder"
LABEL description="Builds the front-end application"

WORKDIR /www

COPY package.json old.json

RUN apk add --update --no-cache jq && \
    jq 'del(.dependencies)' old.json > package.json

COPY front-end ./front-end

# Install dependencies, build, then clean up sources
RUN npm install --no-save && \
    npm run build && \
    rm -rf front-end/source

# ------------------------------
# Stage 2: Serve with Nginx
# ------------------------------
FROM nginx:1.28-alpine3.21

# Metadata labels for the image
LABEL stage="production"
LABEL maintainer="Oussama Kamili <oussama.kamili@protonmail.com>"
LABEL description="Serves the front-end application via Nginx"
LABEL version="1.0.0"

ENV FRONTEND_ORIGIN="127.0.0.1"
ENV BACKEND_API="127.0.0.1:3000"

VOLUME /etc/ssl/gamepad

# Copy built front-end files from builder stage
COPY --from=builder /www/front-end /www

# Copy Nginx configuration and SSL certificates
COPY docker/nginx/assets/launch.sh .
COPY docker/nginx/assets/default.conf /etc/nginx/conf.d/default.conf.template
COPY docker/nginx/ssl /etc/ssl/gamepad/

RUN chmod +x launch.sh

EXPOSE 80/tcp 443/tcp

ENTRYPOINT ["./launch.sh"]