#!/bin/bash
# [COMMUNITY MODE] - 새 토큰 및 'community' DB 사용
export CLOUDFLARE_API_TOKEN="cfut_U4T4ar93F1VBSpyacOBfvTbysfbVvB9RbO3hokGD58c12d27"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Running in COMMUNITY mode..."
npx wrangler d1 execute community --remote --file=./schema.sql -y
