# Family Archive

가족 사진과 글을 모아두는 프라이빗 아카이브 웹 애플리케이션입니다.

> Share and organize family memories

[![CI](https://github.com/jae-yon/fam-archive/actions/workflows/ci.yml/badge.svg)](https://github.com/jae-yon/fam-archive/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## Features

### Gallery
- 갤러리 생성 · 이름 변경 · 삭제
- 다중 사진 업로드 (JPEG, PNG, GIF, WebP, HEIC/HEIF · 파일당 최대 100MB)
- 반응형 앨범 레이아웃 + 라이트박스 뷰어

### Board
- TipTap 기반 리치 텍스트 게시글 작성 · 수정 · 삭제
- 카테고리 관리 및 필터
- 제목 / 본문 텍스트 검색

### Home
- 최근 사진 · 최근 게시글 미리보기
- 로그인 사용자용 빠른 업로드 / 글쓰기

### Auth
- 이메일 · 비밀번호 로그인
- JWT (httpOnly 쿠키) + Argon2 비밀번호 해싱
- 쓰기 작업은 인증 필요 (조회는 로그인 없이 가능)

---

## Tech Stack

| Area | Stack |
|------|--------|
| Framework | Next.js 16 (App Router, standalone) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Data | Prisma 7, MySQL |
| Auth | jose (JWT), argon2 |
| Editor | TipTap |
| Photos | react-photo-album, yet-another-react-lightbox |
| Client state | TanStack Query |
| Deploy | Docker · GHCR · GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 22+
- MySQL (또는 MariaDB)
- npm

### 1. Install

```bash
git clone https://github.com/jae-yon/fam-archive.git
cd fam-archive
npm install
```

### 2. Environment

프로젝트 루트에 `.env` 파일을 생성합니다. **실제 비밀번호·시크릿은 커밋하지 마세요.**

```env
# Database
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=fam_archive
DATABASE_URL="mysql://your_user:your_password@127.0.0.1:3306/fam_archive"

# Auth
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRATION_TIME=86400

# Uploads (absolute or relative path)
UPLOADS_PATH=./uploads
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_HOST` | Yes | DB 호스트 |
| `DATABASE_USER` | Yes | DB 사용자 |
| `DATABASE_PASSWORD` | Yes | DB 비밀번호 |
| `DATABASE_NAME` | Yes | DB 이름 |
| `DATABASE_URL` | Yes | Prisma용 MySQL 연결 문자열 |
| `DATABASE_PORT` | No | 기본값 `3306` |
| `JWT_SECRET` | Yes | JWT 서명 키 |
| `JWT_EXPIRATION_TIME` | No | 초 단위, 기본값 `86400` (1일) |
| `UPLOADS_PATH` | Yes | 업로드 파일 저장 경로 |
| `PORT` | No | 호스트 포트 매핑 (Docker, 기본 `2000`) |
| `DOCKER_UPLOADS_PATH` | No | 호스트 업로드 볼륨 경로 (Docker) |

### 3. Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

초기 관리자 계정은 DB에 직접 생성하거나, Prisma Studio로 추가합니다.

```bash
npm run prisma:studio
```

> 비밀번호는 Argon2 해시로 저장해야 합니다. 평문 비밀번호를 넣지 마세요.

### 4. Run

```bash
npm run dev
```

브라우저에서 [http://localhost:2000](http://localhost:2000) 을 엽니다.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | 개발 서버 (port 2000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 (port 2000) |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Prisma Client 생성 |
| `npm run prisma:migrate` | 마이그레이션 적용 |
| `npm run prisma:push` | 스키마를 DB에 반영 (개발용) |
| `npm run prisma:studio` | Prisma Studio |
| `npm run docker:up` | Docker Compose로 기동 |
| `npm run docker:down` | 컨테이너 중지 |
| `npm run docker:logs` | 앱 로그 스트리밍 |
| `npm run docker:rebuild` | 캐시 없이 재빌드 후 기동 |

---

## Docker

로컬에서 이미지를 빌드해 실행할 수 있습니다. 컨테이너는 시작 시 `prisma migrate deploy` 후 앱을 띄웁니다.

```bash
# 로컬 빌드 (docker-compose.dev.yml)
docker compose -f docker-compose.dev.yml up -d --build

# 또는 npm 스크립트
npm run docker:up
```

프로덕션 Compose는 GHCR 이미지를 pull 합니다.

```bash
docker compose up -d
```

업로드 파일은 `UPLOADS_PATH`(컨테이너 기본 `/uploads`)에 저장되며, Compose에서는 호스트 디렉터리에 마운트됩니다.

---

## Project Structure

```
fam-archive/
├── app/                 # Next.js App Router (pages, API, actions)
├── components/          # UI · editor · photo · sidebar
├── config/              # 앱 이름, 네비게이션, 업로드 제한
├── hooks/               # auth, galleries, posts
├── lib/                 # auth, jwt, prisma, uploads
├── prisma/              # schema · migrations
├── types/
├── Dockerfile
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## CI / CD

- **CI** — push 시 Docker 이미지 빌드 검증
- **CD** — `main` 브랜치 CI 성공 후 GHCR 이미지 배포 (GitHub Actions)

배포에 필요한 시크릿·호스트 정보는 Actions Secrets로만 관리하며, 이 문서에는 포함하지 않습니다.

---