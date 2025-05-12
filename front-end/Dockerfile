FROM nginx:alpine

WORKDIR /www

COPY source /www
COPY config/default.conf /etc/nginx/conf.d/default.conf

RUN apk add --update --no-cache npm && \
    npm install apexcharts esbuild && \
    npx esbuild source/main.ts --bundle --outfile=assets/script.js \
    --target=es6 --platform=browser --minify

EXPOSE 443/tcp

CMD ["nginx", "-g", "daemon off;"]