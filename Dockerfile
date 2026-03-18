# Node.js LTS 이미지를 기반으로 설정
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치 (필요한 경우)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# Wrangler 전역 설치 (CLI 도구)
RUN npm install -g wrangler

# 소스 코드 복사
COPY . .

# Cloudflare Pages 개발 서버 포트 노출
EXPOSE 8788

# 개발 서버 실행 명령어
# --ip 0.0.0.0 설정은 도커 컨테이너 외부 접속을 위해 필수입니다.
CMD ["npx", "wrangler", "pages", "dev", "public", "--d1=DB", "--r2=ASSETS_BUCKET", "--ip", "0.0.0.0"]
