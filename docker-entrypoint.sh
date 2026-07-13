#!/bin/sh
set -e

# Compose overrides DATABASE_HOST to host.docker.internal; rebuild URL so migrate
# uses the same host as the app (secrets.DATABASE_URL may still point at localhost).
uri_encode() {
  node -e "process.stdout.write(encodeURIComponent(process.argv[1] ?? ''))" "$1"
}

if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_USER" ] || [ -z "$DATABASE_NAME" ]; then
  echo "Missing DATABASE_HOST / DATABASE_USER / DATABASE_NAME" >&2
  exit 1
fi

DB_PORT="${DATABASE_PORT:-3306}"
USER_ENC="$(uri_encode "$DATABASE_USER")"
PASS_ENC="$(uri_encode "${DATABASE_PASSWORD:-}")"
NAME_ENC="$(uri_encode "$DATABASE_NAME")"

export DATABASE_URL="mysql://${USER_ENC}:${PASS_ENC}@${DATABASE_HOST}:${DB_PORT}/${NAME_ENC}"

echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Starting application..."
exec node server.js
