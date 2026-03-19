#!/bin/bash
# YomiWiki DB Synchronizer

# 1. 시스템에 로그인된 Cloudflare 계정 정보로 실행
# (실행 전 'npx wrangler login'이 되어 있어야 합니다)

echo "[SYSTEM]: Accessing Cloudflare D1 grid..."
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -y

echo "[SYSTEM]: Database synchronization complete."
