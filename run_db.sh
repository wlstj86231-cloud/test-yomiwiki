#!/bin/bash
# YomiWiki V3 DB Sync - 'Community' Grid Activation

# 1. 인증 정보 설정 (새 토큰 및 기존 계정 ID 적용)
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Handshaking with Cloudflare D1 'community' node..."

# 2. 데이터베이스 실행 (DB 이름을 'community'로 지정)
npx wrangler d1 execute community --remote --file=./schema.sql -y

if [ $? -eq 0 ]; then
    echo "[SYSTEM]: SUCCESS. All archival sectors in 'community' grid are now active."
else
    echo "[ERROR]: Connection failed. If 'community' is not the name, please check the D1 dashboard for the exact name."
fi
