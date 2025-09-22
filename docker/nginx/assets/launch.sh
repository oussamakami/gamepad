#!/bin/sh

envsubst '$FRONTEND_ORIGIN $API_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"