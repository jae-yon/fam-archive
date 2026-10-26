# Changelog

이 프로젝트의 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
버전 표기는 [Semantic Versioning](https://semver.org/lang/ko/)을 사용합니다.

## [Unreleased]

아직 태그가 없어 릴리스되지 않은 변경사항입니다. `package.json`의 버전은 `1.0.0`에서 변경하지 않았습니다.

### Security

의존성 취약점 27건(critical 1, high 3, moderate 23)을 모두 해소했습니다. `npm audit` 결과는 0건입니다.

- **next `16.2.9` → `16.4.3`** — 권고 20건 해소. 이 중 원격 코드 실행 5건이 critical입니다.
  - 이미지 최적화 API의 SVG 파일 처리 RCE ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw))
  - 이미지 최적화 API의 AVIF 파일 처리 RCE ([GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4))
  - `use cache` 함수가 typed array를 반환할 때의 RCE ([GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr))
  - `next/og` ImageResponse RCE ([GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j))
  - Windows 호스팅 서버의 RCE ([GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36))
  - 그 외 이미지 최적화 API·rewrites의 SSRF, SSG/ISR 캐시 포이즈닝, Server Actions DoS 등 15건

  이미지 최적화 API 계열은 `components/common/photo-gallery.tsx`가 `next/image`를 사용하고 사진 업로드를 받는 구조상 실제 노출 경로였습니다. `next/og`와 `use cache`는 미사용, 배포 대상이 Linux 컨테이너이므로 Windows RCE는 해당되지 않았습니다.

- **@tiptap/react · @tiptap/starter-kit `3.27.1` → `3.32.0`** — `@tiptap/core`의 취약점 2건 해소. 게시글 에디터가 사용자 입력을 직접 받는 지점입니다.
  - `mergeAttributes()`의 prototype pollution으로 인한 XSS ([GHSA-cp6q-959q-f8rh](https://github.com/advisories/GHSA-cp6q-959q-f8rh))
  - Markdown 속성 파싱의 quadratic ReDoS ([GHSA-j95f-988m-3j2f](https://github.com/advisories/GHSA-j95f-988m-3j2f))

- **sharp · postcss** — next의 전이 의존성이므로 위 업그레이드로 함께 해소되었습니다. libvips/libheif/librsvg 취약점과 postcss의 XSS·경로 순회 등 high 7건입니다.

### Fixed

- **로그인 페이지의 세션 확인이 멈추는 문제** — `app/login/page.tsx`가 `useGetUser()` 훅을 `useEffect` 내부의 async 함수에서 호출하고 있었습니다. 훅은 렌더 단계에서만 호출할 수 있어 토큰이 있는 경우 React가 에러를 던지고, 그 에러가 async 함수 안에서 unhandled rejection이 되어 `setCheckingSession(false)`까지 도달하지 못했습니다. 유효한 토큰을 가진 사용자가 `/login`에 접근하면 "확인 중..." 화면에서 더 이상 진행되지 않았습니다.

  훅을 컴포넌트 최상위로 옮기고 조회 상태(`isPending`)와 결과(`data`)로 분기하도록 변경했습니다. 리다이렉트가 끝나기 전 로그인 폼이 잠깐 보이지 않도록, 사용자 정보가 있는 동안에도 확인 화면을 유지합니다.

### Changed

- **effect 내 setState 제거** — `eslint-plugin-react-hooks`의 `set-state-in-effect`·`refs`, `react/no-unescaped-entities` 위반 16건을 해소했습니다. 상황에 따라 세 가지 방식을 적용했습니다.

  | 방식 | 대상 |
  | --- | --- |
  | 파생값으로 대체 | `authorized`, `categoryList`, `usePosts` 조회 옵션, post-sheet의 `categories` |
  | 렌더 중 조정 | date-picker·post-sheet·gallery-sidebar의 prop 동기화 |
  | 이벤트 핸들러로 이동 | photo-upload-dialog의 닫힘 초기화, 언마운트 정리용 ref 쓰기 |
  | `useSyncExternalStore` | use-mobile의 matchMedia 구독 |

  `gallery-sidebar.tsx`는 effect를 둘로 나눴습니다. 로컬 state 초기화는 렌더 중 조정으로 처리하고, react-query의 `reset()` 호출은 외부 스토어 부수효과이므로 effect에 남겼습니다. `use-mobile`은 첫 클라이언트 렌더부터 올바른 값을 반환하게 되었습니다.

- **의존성 최신화 (minor·patch)** — react/react-dom `19.2.4` → `19.3.1`, @prisma/client·prisma `7.8.0` → `7.10.1`, @base-ui/react `1.6.0` → `1.9.0`, @tanstack/react-query `5.101.2` → `5.104.5`, lucide-react `1.23.0` → `1.61.0`, jose `6.2.3` → `6.2.13`, tailwindcss `4.3.2` → `4.3.3`, 그 외 argon2·sonner·tailwind-merge·react-day-picker·react-photo-album·yet-another-react-lightbox.

- **Dockerfile의 네이티브 바이너리·CLI 핀 정렬** — lockfile과 어긋나면 이미지 빌드나 런타임이 깨지는 지점입니다.
  - `@tailwindcss/oxide-linux-x64-gnu` `4.3.2` → `4.3.3` (tailwindcss 버전과 일치)
  - 런타임 Prisma CLI `7.8.0` → `7.10.1` (빌더에서 생성되는 클라이언트와 일치)
  - `lightningcss-linux-x64-gnu`는 의존성 트리의 `lightningcss`가 `1.32.0`을 유지하므로 기존 핀을 그대로 두었습니다.

### Added

- **CI에 린트·타입체크 단계 추가** — `verify` 잡을 추가하고 기존 `build` 잡이 이를 `needs`로 참조합니다. `verify`가 실패하면 이미지 빌드를 건너뛰고 워크플로 결론이 `failure`가 되므로, CI 성공을 조건으로 하는 CD도 배포를 진행하지 않습니다.

  Next 16에서 `next lint`가 제거되어 `next build`는 ESLint를 실행하지 않습니다. 린트 오류가 전혀 걸러지지 않던 상태였습니다. 타입체크는 `next build`가 프로젝트의 `tsc`로 수행하지만 이미지 빌드 로그에 묻혀 피드백이 느립니다.

  Prisma Client는 gitignore 대상이라 린트·타입체크 전에 생성해야 하며, `prisma.config.ts`가 `DATABASE_URL`을 읽으므로 Dockerfile과 동일한 더미 값을 주입합니다. Node 버전은 Dockerfile의 `node:22`에 맞췄습니다.

- **`npm run typecheck` 스크립트** — `next typegen && tsc --noEmit`. 라우트 타입은 `next dev`·`next build` 시점에만 생성되어 `tsc` 단독 실행으로는 검증되지 않고, 신규 체크아웃에는 `next-env.d.ts`도 없어 `tsc`가 실패합니다.

### Known Issues

- **린트 경고 7건** — `@typescript-eslint/no-unused-vars` 5건, `@next/next/no-img-element` 2건. 경고는 lint를 실패시키지 않아 CI를 통과합니다. 정리 후 `--max-warnings 0`을 적용할 수 있습니다.
- **Turbopack 빌드 경고** — `app/actions/gallery-actions.ts`의 `path.join(process.cwd(), getUploadRootPath(), data.id)`가 동적 경로여서 프로젝트 전체가 트레이싱 대상이 됩니다. `public` 폴더까지 서버 번들에 포함되어 이미지 크기가 불필요하게 커집니다.
- **Node 버전 고정 지점 부재** — `package.json`의 `engines`와 `.nvmrc`가 없어 Dockerfile의 `node:22`만이 유일한 기준입니다. `node:22`는 플로팅 태그이므로 빌드 시점마다 패치 버전이 달라질 수 있습니다.
