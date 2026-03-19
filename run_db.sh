#!/bin/bash
# YomiWiki V3 DB Sync - 정석 복구 모드

# 1. 인증 정보 설정 (새로운 토큰 및 기존 계정 ID 적용)
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Accessing the archival grid with 'community' credentials..."

# 2. 데이터베이스 실행 (가장 확실한 이름 'yomi-db' 사용 및 자동 승인)
npx wrangler d1 execute yomi-db --remote --file=./schema.sql -y

if [ $? -eq 0 ]; then
    echo "[SYSTEM]: SUCCESS. All regional sector nodes are now ONLINE."
else
    echo "[ERROR]: Connection failed. Please ensure the token is correctly linked to the 'community' project."
fi
