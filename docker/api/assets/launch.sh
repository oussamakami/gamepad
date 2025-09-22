#!/bin/sh

if [ ! -f /run/secrets/configuration ]; then
    echo "Error: missing .env file." >&2
    exit 1
fi

cp /run/secrets/configuration .env
printf '\nCLIENTS_DATA_PATH="/server/clientsData"' >> .env
exec npm start