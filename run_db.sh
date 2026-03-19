#!/bin/bash
# 1. 인증 정보 설정
export CLOUDFLARE_API_TOKEN="cfut_V63V7wKw8G8zLhH3l9KjZawx0QUPiUoFNLMSQH2Ceb24d2c1"
export CLOUDFLARE_ACCOUNT_ID="e56e1153c80086f2470940d664b46eb3"

# 2. 데이터베이스 실행 (정확한 DB 이름 'yomi-db-prod' 사용 및 자동 승인)
npx wrangler d1 execute yomi-db-prod --remote --file=./schema.sql -y
