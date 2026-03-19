#!/bin/bash
# YomiWiki V3 DB Sync - Ultimate Precision Mode

# 1. Cloudflare 인증 정보 (새 토큰 및 기존 계정 ID 복구)
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Initiating archival handshake using Database ID..."

# 2. DB 실행 (이름 대신 ID 'd51a513c-fea7-458c-9c0e-b5f08f474689'를 직접 타겟팅)
npx wrangler d1 execute d51a513c-fea7-458c-9c0e-b5f08f474689 --remote --file=./schema.sql -y

if [ $? -eq 0 ]; then
    echo "[SYSTEM]: SUCCESS. All regional sector nodes are now ONLINE."
else
    echo "[ERROR]: Connection failed. Please ensure the new token has 'D1 Edit' permissions."
fi
