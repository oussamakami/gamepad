#!/bin/sh

envsubst '$FRONTEND_ORIGIN $BACKEND_API' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"