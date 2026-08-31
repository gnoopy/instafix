#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT=42937
PID_FILE="deploy/run/next.pid"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Running (pid $(cat "$PID_FILE"))"
else
  echo "Not running (no live pid)"
fi

if ss -tln 2>/dev/null | awk -v p=":$PORT" '$4 ~ p"$"' | grep -q .; then
  echo "Port ${PORT}: listening"
else
  echo "Port ${PORT}: not listening"
fi

curl -fsS -o /dev/null -w "http://127.0.0.1:${PORT}/demo -> %{http_code}\n" "http://127.0.0.1:${PORT}/demo" || echo "http://127.0.0.1:${PORT}/demo -> unreachable"
