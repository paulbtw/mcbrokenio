#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/debug-eu-api.sh [env-file] [country] [latitude] [longitude]

Examples:
  ./scripts/debug-eu-api.sh /Users/paulvatiche/git/mcbrokenio/.env
  ./scripts/debug-eu-api.sh /Users/paulvatiche/git/mcbrokenio/.env DE 52.52 13.405

This script:
  1. Loads BASIC_TOKEN_EU from the given env file
  2. Fetches a fresh EU bearer token
  3. Calls the EU store-list endpoint for the requested location
  4. Calls the EU restaurant-detail endpoint with both the broken and working params
  5. Prints the exact API validation errors and outage payload presence
EOF
}

decode_base64() {
  local value="$1"

  if printf '%s' "$value" | base64 --decode >/dev/null 2>&1; then
    printf '%s' "$value" | base64 --decode
    return
  fi

  if printf '%s' "$value" | base64 -d >/dev/null 2>&1; then
    printf '%s' "$value" | base64 -d
    return
  fi

  printf '%s' "$value" | base64 -D
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_command curl
require_command jq
require_command base64

ENV_FILE="${1:-.env}"
COUNTRY="${2:-DE}"
LATITUDE="${3:-52.52}"
LONGITUDE="${4:-13.405}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${BASIC_TOKEN_EU:-}" ]]; then
  echo "BASIC_TOKEN_EU is missing from $ENV_FILE" >&2
  exit 1
fi

CLIENT_ID="$(decode_base64 "$BASIC_TOKEN_EU" | cut -d: -f1)"

TOKEN="$(
  curl -sS 'https://eu-prod.api.mcd.com/v1/security/auth/token' \
    -X POST \
    -H "authorization: Basic $BASIC_TOKEN_EU" \
    -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' |
    jq -r '.response.token'
)"

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Failed to obtain EU bearer token" >&2
  exit 1
fi

COMMON_HEADERS=(
  -H "authorization: Bearer $TOKEN"
  -H "mcd-clientid: $CLIENT_ID"
  -H "mcd-marketid: $COUNTRY"
  -H 'mcd-uuid: "'
)

SUMMARY_RESPONSE="$(
  curl -sS \
    "https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=summary&pageSize=5&latitude=$LATITUDE&longitude=$LONGITUDE" \
    "${COMMON_HEADERS[@]}" \
    -H 'accept-language: de-DE' \
    -H 'user-agent: Mozilla/5.0'
)"

FULL_RESPONSE="$(
  curl -sS \
    "https://eu-prod.api.mcd.com/exp/v1/restaurant/location?distance=10000&filter=full&pageSize=1&latitude=$LATITUDE&longitude=$LONGITUDE" \
    "${COMMON_HEADERS[@]}" \
    -H 'accept-language: de-DE' \
    -H 'user-agent: Mozilla/5.0'
)"

STORE_NUMBER="$(printf '%s' "$SUMMARY_RESPONSE" | jq -r '.response.restaurants[0].nationalStoreNumber')"
GBL_NUMBER="$(printf '%s' "$FULL_RESPONSE" | jq -r '.response.restaurants[0].gblNumber')"
STORE_NAME="$(printf '%s' "$SUMMARY_RESPONSE" | jq -r '.response.restaurants[0].name')"

if [[ -z "$STORE_NUMBER" || "$STORE_NUMBER" == "null" ]]; then
  echo "Could not find a store in the summary response" >&2
  printf '%s\n' "$SUMMARY_RESPONSE" | jq '.'
  exit 1
fi

CURRENT_DETAIL_RESPONSE="$(
  curl -sS \
    "https://eu-prod.api.mcd.com/exp/v1/restaurant/$STORE_NUMBER?filter=full&storeUniqueIdType=NatlStrNumber" \
    "${COMMON_HEADERS[@]}" \
    -H 'mcd-sourceapp: GMA' \
    -H 'accept-language: en-GB'
)"

WORKING_DETAIL_RESPONSE="$(
  curl -sS \
    "https://eu-prod.api.mcd.com/exp/v1/restaurant/$STORE_NUMBER?filter=full&storeUniqueIdType=gblNumber" \
    "${COMMON_HEADERS[@]}" \
    -H 'mcd-sourceapp: GMA' \
    -H 'accept-language: en-GB'
)"

GBL_DETAIL_RESPONSE="$(
  curl -sS \
    "https://eu-prod.api.mcd.com/exp/v1/restaurant/$GBL_NUMBER?filter=full&storeUniqueIdType=gblNumber" \
    "${COMMON_HEADERS[@]}" \
    -H 'mcd-sourceapp: GMA' \
    -H 'accept-language: en-GB'
)"

cat <<EOF
EU auth: ok
Country: $COUNTRY
Coordinates: $LATITUDE,$LONGITUDE

First nearby store:
  nationalStoreNumber: $STORE_NUMBER
  gblNumber: $GBL_NUMBER
  name: $STORE_NAME

Summary response status:
EOF
printf '%s\n' "$SUMMARY_RESPONSE" | jq '{status: .status, storeCount: (.response.restaurants | length)}'

cat <<'EOF'

Detail response using current production request:
EOF
printf '%s\n' "$CURRENT_DETAIL_RESPONSE" | jq '{status: .status, responsePresent: (.response != null)}'

cat <<'EOF'

Detail response using nationalStoreNumber path with gblNumber type:
EOF
printf '%s\n' "$WORKING_DETAIL_RESPONSE" | jq '{
  status: .status,
  responsePresent: (.response != null),
  outageCount: (.response.restaurant.catalog.outageProductCodes | length // 0)
}'

cat <<'EOF'

Detail response using gblNumber path with gblNumber type:
EOF
printf '%s\n' "$GBL_DETAIL_RESPONSE" | jq '{status: .status, responsePresent: (.response != null)}'
