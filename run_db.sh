#!/bin/bash
# YomiWiki V3 DB Sync - 고성능 인증 모드 (Updated Token)

# 1. Cloudflare 인증 정보 (새로 발급받은 토큰 적용)
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export WRANGLER_AUTH_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Initiating secure handshake with new credentials..."

# 2. DB 실행 (yomi-db-prod 프로덕션 DB에 최신 스키마 및 시드 데이터 주입)
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -y

if [ $? -eq 0 ]; then
    echo "[SYSTEM]: SUCCESS. All regional sector nodes have been established."
else
    echo "[ERROR]: Handshake failed. Please verify the token permissions on Cloudflare dashboard."
fi
