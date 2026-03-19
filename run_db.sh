#!/bin/bash
# YomiWiki V3 Database Synchronizer [SECURE_UPLINK]

# 1. 인증 정보 설정 (Cloudflare API)
export CLOUDFLARE_API_TOKEN="cfut_V63V7wKw8G8zLhH3l9KjZawx0QUPiUoFNLMSQH2Ceb24d2c1"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

echo "[SYSTEM]: Initiating database handshake with Cloudflare D1..."
echo "[SYSTEM]: Injecting regional sector protocols (Seed Data)..."

# 2. 데이터베이스 실행 (모든 지역 섹터 강제 활성화)
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -e production -y

echo "[SYSTEM]: Synchronization complete. All archival nodes are now active."
