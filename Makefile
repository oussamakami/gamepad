.SILENT:

all: start

start: create
	docker compose up -d

create:
	docker compose create

watch:
	-docker compose logs -f || true

stop:
	docker compose stop

down:
	docker compose down

clean: down
	docker compose rm

fclean: clean
	docker compose down -v

wipe: fclean
	docker system prune -af

re: restart

restart: wipe start