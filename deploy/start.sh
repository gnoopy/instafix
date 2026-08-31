#!/usr/bin/env bash
# Start the InstaFix demo app (apps/demo) in production mode.
#
#   bash deploy/start.sh        # build then start (production)
#   bash deploy/start.sh nobuild # start without rebuilding (assumes a prior build)
#
# Stop: deploy/stop.sh   Status: deploy/status.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p deploy/logs deploy/run

PORT=42937 # instafix.realstory.blog — see Caddyfile.instafix
HOST=127.0.0.1

port_busy() { ss -tln 2>/dev/null | awk -v p=":$1" '$4 ~ p"$"' | grep -q .; }
if port_busy "$PORT"; then
  echo "Port ${PORT} is already in use — run deploy/status.sh or deploy/stop.sh first." >&2
  exit 1
fi

export PATH="$HOME/.bun/bin:$PATH"

MODE="${1:-build}"
if [[ "$MODE" == "build" ]]; then
  echo "Building..."
  bun run build
fi

echo "Starting apps/demo (Next.js) on ${HOST}:${PORT}..."
cd apps/demo
nohup node_modules/.bin/next start -p "$PORT" -H "$HOST" > ../../deploy/logs/next.log 2>&1 &
echo $! > ../../deploy/run/next.pid
cd "$ROOT"

for _ in $(seq 1 60); do
  port_busy "$PORT" && break
  sleep 0.5
done

if port_busy "$PORT"; then
  echo "InstaFix demo is up on http://${HOST}:${PORT} (pid $(cat deploy/run/next.pid))"
else
  echo "Failed to start — check deploy/logs/next.log" >&2
  exit 1
fi
