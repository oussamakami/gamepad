#!/bin/sh

cp /run/secrets/credentials .env

echo -e "#!/bin/sh\n\nexec npm start" > launch.sh

exec npm start