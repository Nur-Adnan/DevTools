.PHONY: dev build prod db-migrate db-studio logs clean

dev:
	docker compose up

build:
	docker compose build

prod:
	docker compose -f docker-compose.prod.yml up

db-migrate:
	docker compose exec web pnpm db:migrate

db-studio:
	docker compose exec web pnpm prisma studio

logs:
	docker compose logs -f web

clean:
	docker compose down -v --remove-orphans
