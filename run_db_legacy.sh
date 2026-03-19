#!/bin/bash
# [LEGACY MODE] - 기존 토큰 및 'yomi-db-prod' DB 사용
export CLOUDFLARE_API_TOKEN="cfut_V63V7wKw8G8zLhH3l9KjZawx0QUPiUoFNLMSQH2Ceb24d2c1"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Running in LEGACY mode..."
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -y
