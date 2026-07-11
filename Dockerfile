# 빌드 환경 설정
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# 필요한 패키지 설치
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Next.js 텔레메트리 비활성화 (데이터 수집 방지)
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma Client 생성을 위한 임시 데이터베이스 설정
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"

# 패키지 설치
COPY package.json package-lock.json ./
RUN npm ci \
  && npm install --no-save \
    lightningcss-linux-x64-gnu@1.32.0 \
    @tailwindcss/oxide-linux-x64-gnu@4.3.2

# 프로젝트 코드 복사
COPY . .

# Prisma Client 생성
RUN npm run prisma:generate
RUN npm run build

# 런타임
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# 필요한 패키지 설치
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 환경 변수 설정
ENV NODE_ENV=production

# Next.js 텔레메트리 비활성화 (데이터 수집 방지)
ENV NEXT_TELEMETRY_DISABLED=1

# 포트 설정
ENV PORT=2000

# 호스트 설정
ENV HOSTNAME=0.0.0.0

# 그룹 및 사용자 생성
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# 공개 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated

USER nextjs

EXPOSE 2000

CMD ["node", "server.js"]
