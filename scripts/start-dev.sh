#!/usr/bin/env bash
# IVA Cortex — Development Startup
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="${PG_BIN:-/tmp/pg-extract/usr/lib/postgresql/16/bin}"
PGDATA="${PGDATA:-/tmp/pgdata}"
# Add Chrome libs for Puppeteer PDF generation in dev (extracted from debs)
export LD_LIBRARY_PATH="/tmp/chrome-libs/usr/lib/x86_64-linux-gnu:${PG_BIN}/../lib:/tmp/pg-extract/usr/lib/x86_64-linux-gnu"

echo "═══ IVA Cortex Dev ═══"

# Start PostgreSQL if managed locally
if [ -f "$PG_BIN/pg_ctl" ] && [ -d "$PGDATA" ]; then
  if ! "$PG_BIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    "$PG_BIN/pg_ctl" -D "$PGDATA" -l "$PGDATA/pg.log" -o "-p 5433 -k /tmp" start
    sleep 2
  fi
  echo "  ✓ PostgreSQL on port 5433"
fi

# Create .env if missing
[ -f "$ROOT/.env" ] || cp "$ROOT/.env.example" "$ROOT/.env"

cd "$ROOT"
exec node src/server.js
