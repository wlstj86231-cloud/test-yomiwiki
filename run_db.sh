#!/bin/bash
# YomiWiki V3 DB Sync - 고성능 인증 모드

# 1. Cloudflare 인증 정보 (두 가지 변수명 모두 지원)
export CLOUDFLARE_API_TOKEN="cfut_V63V7wKw8G8zLhH3l9KjZawx0QUPiUoFNLMSQH2Ceb24d2c1"
export WRANGLER_AUTH_TOKEN="cfut_V63V7wKw8G8zLhH3l9KjZawx0QUPiUoFNLMSQH2Ceb24d2c1"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Attempting secure handshake with D1 Grid..."

# 2. DB 실행 (yomi-db-prod 이름을 정확히 사용하고 자동 승인 옵션 적용)
# 만약 여기서 에러가 나면 'npx wrangler login'을 터미널에 한 번만 쳐주세요.
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -y

if [ $? -eq 0 ]; then
    echo "[SYSTEM]: SUCCESS. All regional nodes initialized."
else
    echo "[ERROR]: Handshake failed. Please run 'npx wrangler login' manually."
fi
