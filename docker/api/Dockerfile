FROM node:22-alpine3.21

# Metadata labels for the image
LABEL stage="production"
LABEL maintainer="Oussama Kamili <oussama.kamili@protonmail.com>"
LABEL description="Serves the back-end API via Node.js"
LABEL version="1.0.0"

WORKDIR /server

COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the application source code
COPY api-source ./api-source
COPY docker/api/assets/launch.sh ./

# Make the launch script executable
RUN chmod +x ./launch.sh

ENTRYPOINT ["./launch.sh"]