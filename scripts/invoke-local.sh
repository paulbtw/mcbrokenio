#!/usr/bin/env bash
# Usage: ./scripts/invoke-local.sh <app> <function> [extra serverless flags]
#
# Examples:
#   ./scripts/invoke-local.sh mcall getItemStatusEu
#   ./scripts/invoke-local.sh mcus getAllStores
#   ./scripts/invoke-local.sh mcau getItemStatus

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

APP="${1:?Usage: invoke-local.sh <app> <function> [extra flags]}"
FUNCTION="${2:?Usage: invoke-local.sh <app> <function> [extra flags]}"
shift 2

case "$APP" in
  mcall|mcus|mcau) ;;
  *)
    echo "Error: Invalid app '$APP'. Must be one of: mcall, mcus, mcau"
    exit 1
    ;;
esac

APP_DIR="$ROOT_DIR/apps/$APP"
PRISMA_DIR="$ROOT_DIR/packages/database/generated/prisma"
LOCAL_ENGINE=$(find "$PRISMA_DIR" -name 'libquery_engine-*' ! -name '*rhel*' -maxdepth 1 2>/dev/null | head -1)

if [ -z "$LOCAL_ENGINE" ]; then
  echo "Error: No native Prisma engine found. Run 'pnpm turbo run db:generate' first."
  exit 1
fi

echo "Invoking $APP/$FUNCTION locally..."
cd "$APP_DIR" && pnpm invoke "$FUNCTION" -e "PRISMA_QUERY_ENGINE_LIBRARY=$LOCAL_ENGINE" "$@"
