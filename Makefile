.SILENT:

# Paths and flags
ENV_PATH        :=  .env
COMPOSE_PATH    :=  docker/docker-compose.yml
FLAGS           :=  -f ${COMPOSE_PATH} --env-file ${ENV_PATH}

# Default Variables value
TARGET          ?=  api frontend
COMPOSE         ?=  docker compose

.PHONY: all start build stop restart logs watch down clean fclean help

all     :  start

start   :
	${COMPOSE} ${FLAGS} up -d ${TARGET}

build   :
	${COMPOSE} ${FLAGS} build ${TARGET}

stop    :
	${COMPOSE} ${FLAGS} stop ${TARGET}

restart :
	${COMPOSE} ${FLAGS} restart ${TARGET}

logs    :
	${COMPOSE} ${FLAGS} logs ${TARGET}

watch   :
	-@${COMPOSE} ${FLAGS} logs -f ${TARGET}

list ls :
	${COMPOSE} ${FLAGS} ps ${TARGET}

down    :  stop
	${COMPOSE} ${FLAGS} down

clean   :  stop
	${COMPOSE} ${FLAGS} down --rmi all -v --remove-orphans
	docker image prune -f --filter "label=project=gamepad"

fclean  :  clean
	docker builder prune -a

ssl     :
	openssl req -x509 -nodes -batch -days 365 -newkey rsa:2048 -keyout docker/nginx/ssl/privkey.pem -out docker/nginx/ssl/cert.pem

help:
	@echo "Usage: make [COMMAND] [OPTIONS]"
	@echo ""
	@echo ""
	@echo "COMMAND:"
	@echo "  all / start  # Build image(s) if necessary and start container(s) (default)"
	@echo "  build        # Build TARGET image(s) (default: api frontend)"
	@echo "  stop         # Stop TARGET container"
	@echo "  restart      # Restart TARGET container"
	@echo "  logs         # Show logs for TARGET container"
	@echo "  watch        # Follow logs for TARGET container (Ctrl+C to exit)"
	@echo "  list / ls    # List running container(s)"
	@echo "  down         # Stop all containers (ignores TARGET)"
	@echo "  clean        # Stop containers, remove images and volumes (ignores TARGET)"
	@echo "  fclean       # Run clean and remove build cache (ignores TARGET)"
	@echo "  ssl          # Create a self-signed SSL certificate in docker/nginx/assets/ssl (ignores OPTIONS)"
	@echo "  help         # Display this help message"
	@echo ""
	@echo ""
	@echo "OPTIONS:"
	@echo "  TARGET       # Which container to operate on (default: 'api frontend')"
	@echo "  COMPOSE      # Docker Compose command (default: 'docker compose')"
	@echo ""
	@echo ""
	@echo "EXAMPLES:"
	@echo "  Restart all container(s):"
	@echo "      $$ make restart"
	@echo ""
	@echo "  Build only the Front-End container:"
	@echo "      $$ make build TARGET=frontend"
	@echo ""
	@echo "  Start only the API container:"
	@echo "      $$ make start TARGET=api"
	@echo ""
	@echo "  Show logs for the API container using a custom Docker Compose executable:"
	@echo "      $$ make logs TARGET=api COMPOSE=docker-compose"