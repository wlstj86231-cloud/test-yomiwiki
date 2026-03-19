#!/bin/bash
# [COMMUNITY MODE] - 새 토큰 및 자동 이름 탐색
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Listing all available D1 databases for this token..."
npx wrangler d1 list

echo ""
echo "[SYSTEM]: Attempting execution using the most likely name 'yomi-db-prod' with production flag..."
# -e production 플래그를 사용하여 wrangler.toml의 프로덕션 설정을 강제로 불러옵니다.
npx wrangler d1 execute DB --remote --file=./schema.sql -e production -y

if [ $? -ne 0 ]; then
    echo "[SYSTEM]: Fallback attempt using name 'community'..."
    npx wrangler d1 execute community --remote --file=./schema.sql -y
fi
