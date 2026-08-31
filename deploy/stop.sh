#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PID_FILE="deploy/run/next.pid"
if [[ ! -f "$PID_FILE" ]]; then
  echo "No pid file — nothing to stop (deploy/run/next.pid missing)."
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Stopped InstaFix demo (pid $PID)."
else
  echo "Process $PID not running."
fi
rm -f "$PID_FILE"
