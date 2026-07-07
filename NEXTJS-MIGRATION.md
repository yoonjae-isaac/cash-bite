# cash-bite 프론트 Next.js 이전 계획 (App Router) — SEO/AdSense 통합

> 실행은 메모리 컴팩트 이후. 이 문서가 **단일 정본**이다. 착수 시 이 파일부터 읽고 순서대로 진행.
> 최상위 제약: **클라이언트 사용자 입장에서 기존 Vite 앱과 시각·동작 차이가 0** 이어야 한다(파리티).

---

## 0. 배경 / 목표
- 현재: Vite/React SPA + 해시 라우팅(`usePageStore` = `#macro`) + CSR only + per-page 메타 없음 → 검색엔진이 루트 1개만 색인, AdSense 요건 미충족.
- 목표: **Next.js(App Router)로 프론트 이전** → 파일 라우팅·per-route 메타·SSG/SSR·robots/sitemap **네이티브**로 확보. 기존 SEO 개선 7단계를 Next 방식으로 흡수.
- 범위: **프론트(cash-bite)만.** 백엔드(NestJS/Railway)·API 계약 **무변경** — Next는 동일 API를 호출.
- 배포: Vercel(현 프로젝트 유지). Next는 Vercel 네이티브.

## 결정된 방향
- **인플레이스 전환**(같은 `cash-bite` repo를 Vite→Next로). 별도 신규 repo 아님. **작업 브랜치**(`feat/nextjs`)에서 진행 후 검증되면 main.
- **"대부분 client 컴포넌트 + 선택적 서버"** 전략:
  - 인터랙티브 페이지 컴포넌트(StockPage·MacroPage 등)는 `"use client"`로 그대로 이식(동작 파리티).
  - 각 route의 `page.tsx`(서버 컴포넌트)는 **metadata export + JSON-LD**만 담당하고 그 안에 client 페이지 컴포넌트를 렌더.
  - 정적/콘텐츠 route(홈 랜딩·tools·교육글·privacy/terms/about)는 **SSG**로 완전 정적화(크롤러가 완성 HTML을 봄) → 기존 Phase 5(puppeteer 프리렌더) 대체.
  - 동적 데이터 페이지(news/macro/stock/gurus/calendar)는 v1에서 **클라 패칭 유지(파리티 우선)** + per-route 메타. (후속: 서버 컴포넌트로 초기데이터 이관해 SEO 상한 ↑ — v1 아님)
- i18n: 커스텀 `useLanguageStore`(클라, localStorage) **유지**. 서버 메타 기본 로케일 = **ko**. **로케일-in-URL(next-intl)은 v1 제외**(파리티·범위 이유) → 후속.

## 왜 이 페이즈 매핑인가 (기존 7단계 → Next)
| 기존 | Next에서 | 비고 |
|---|---|---|
| P1 해시→경로 라우팅 | **파일 라우팅 + `<Link>`** (usePageStore 제거) | Next 네이티브, vercel.json rewrite 불필요 |
| P2 useSeo 메타 | **Metadata API**(`metadata`/`generateMetadata`) | helmet 불필요 |
| P3 robots/sitemap | **`app/robots.ts` + `app/sitemap.ts`** | 네이티브 파일 규약 |
| P4 개인정보/약관/CMP/ads.txt | route 페이지 + CMP 클라 + `public/ads.txt` | 동일(경로만 Next) |
| P5 프리렌더(SSG) | **네이티브 SSG/ISR** | puppeteer 제거 — Next의 핵심 이점 |
| P6 계산기/교육 콘텐츠 | `app/tools/*` + MDX | calc 로직 재작성(§아래) |
| P7 Search Console/AdSense | 동일(sitemap·robots·verification 메타 네이티브) | |

---

## 1. 이식 인벤토리 (그대로 옮기는 것)
경로 alias 유지(`@/` 또는 기존 상대경로). 아래는 **거의 무변경 이식**:
- `src/components/**`(레이아웃·stock·macro·persona·guru·portfolio·ui 등) — 대부분 `"use client"` 부여만.
- `src/domain/**`(타입·format·balance 등), `src/application/**`, `src/infrastructure/**`(api 클라이언트·i18n 로케일 JSON·analytics), `src/store/**`(zustand), `src/presentation/**`, `src/data/**`(stockSymbols json).
- 스타일: `src/index.css`(Tailwind v4 `@import "tailwindcss"` + cb-* 토큰 + `[data-theme]`/`[data-updown]` 변형) → `app/globals.css`.
- 자산: `public/`(logo·favicon·icons·symbols.json) 그대로.

## 2. 페이지 → route 매핑 (`app/`)
현재 10개 페이지. route 규약:
```
app/layout.tsx            루트 레이아웃 (html lang=ko, GTM, providers, Header/ExchangeRateBar/Footer)
app/page.tsx              home  (HomePage)
app/news/page.tsx         NewsPage
app/gurus/page.tsx        GuruPage
app/stock/page.tsx        StockPage
app/macro/page.tsx        MacroPage
app/calendar/page.tsx     CalendarPage
app/persona/page.tsx      PersonaPage  (FEATURES.persona=false → notFound())
app/tools/…               Phase G (계산기 허브 + 개별)
app/privacy, app/terms, app/about   Phase F
```
- 각 `page.tsx`: 서버 컴포넌트. `export const metadata`(or `generateMetadata` for 동적) + 내부에 client 페이지 컴포넌트 렌더.
- 기존 `usePageStore`(page state) **제거** → 현재 route 판별은 `usePathname()`. nav active·이동은 `<Link>`.
- 숨김 유틸(compound/averaging/portfolio)은 라우트 미생성(현 상태 유지). PageId 타입은 nav 라벨용으로만 잔존 가능.

## 3. 실행 페이즈 (브랜치 `feat/nextjs`, 순서대로)

### Phase A — 스캐폴딩 & 인프라 이관 (동작은 아직 기존과 동일 목표)
1. 의존성: `next` 추가, `vite`·`@vitejs/*`·`@tailwindcss/vite` 제거. `react`/`react-dom`은 Next 호환 버전. `tailwindcss`·`postcss`는 유지(Next PostCSS). 스크립트 `dev/build/start`를 next로.
2. 설정: `next.config.ts`(또는 .mjs), `tsconfig.json`(Next 기본 + `paths` 유지), `app/globals.css`(index.css 이식), `postcss.config`(tailwindcss v4). `index.html` 삭제 → `app/layout.tsx`로 이관(폰트 link/preconnect, GTM, 메타).
3. env: **`import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`** 전면 치환. 대상 최소: `infrastructure/api/backendClient.ts`(API base), `infrastructure/analytics/ga.ts`, GTM 키. `.env` 예시 갱신(NEXT_PUBLIC_API_BASE_URL 등).
4. `main.tsx`/`App.tsx` 제거 → `app/layout.tsx` + `app/page.tsx`로 재구성.
5. 검증: `next dev` 기동, 홈 렌더, 콘솔 에러 없음.

### Phase B — 레이아웃 & 라우팅 (P1 대체) · 파리티 최우선
1. `app/layout.tsx`: `<html lang="ko" suppressHydrationWarning>` + `<body>`. 내부에 `Header`·`ExchangeRateBar`·`<main class=…>{children}`·`Footer`(현 App.tsx 레이아웃 그대로). GTM은 `next/script`(afterInteractive).
2. **테마/토글 플래시 방지**: `data-theme`(다크/라이트)·`data-updown`을 하이드레이션 전에 세팅하는 인라인 스크립트를 layout `<head>`에 삽입(localStorage 읽어 `documentElement`에 attribute). next-themes류 원리. useThemeStore·UpDownToggle는 이 초기값과 동기화.
3. 라우팅 이관:
   - Header/Footer/RightRail nav: `navigate(id)` → **`<Link href={pathOf(id)}>`**. active = `usePathname()`. (pathOf 맵: home `/`, news `/news`, …)
   - `usePageStore` **삭제**. 호출부(App·Header·Footer·RightRail·HomePage·MarketNewsPreview) 정리: 페이지 이동은 `<Link>` 또는 `useRouter().push`, 현재 페이지는 `usePathname()`.
   - `HomePage`의 섹션→페이지 이동 버튼, `MarketNewsPreview`의 이동도 `<Link>`.
   - `persona` 숨김: nav 조건 제외(FEATURES.persona) + `app/persona/page.tsx`에서 `if(!FEATURES.persona) notFound()`.
4. `Reveal`(페이지 진입 애니메이션): route 전환 시 동작하도록 유지(`usePathname` key). 파리티 확인.
5. 검증(**파리티**): 모든 탭 클릭·뒤로/앞으로·딥링크(`/macro` 직접 진입)·새로고침이 기존과 동일. 시각 diff 없음. 언어/테마/updown 토글 정상, 새로고침 시 깜빡임 없음.

### Phase C — 메타 + 구조화 데이터 (P2 대체)
1. 루트 `metadata`: `metadataBase: new URL(SITE)`, title 템플릿(`%s · AntsUp`), description, `openGraph`(image=/logo.png), `icons`, `robots`. `SITE = process.env.NEXT_PUBLIC_SITE_URL`(도메인 확정 후 설정; 미설정 시 임시값).
2. route별 `export const metadata`(정적) 또는 `generateMetadata`(stock 등 동적 — 티커/종목명 반영). ko 기준 문구(i18n 텍스트 상수 재사용).
3. JSON-LD: 홈=`WebSite`(+SearchAction), 계산기=`WebApplication`, 교육글=`Article` — 서버 컴포넌트에서 `<script type="application/ld+json">`.
4. 검증: 각 route **view-source**(SSR HTML)에 고유 title·canonical·og 포함(클라 렌더 아님).

### Phase D — robots + sitemap (P3 대체)
- `app/robots.ts`(Allow + host + sitemap URL), `app/sitemap.ts`(route 목록: 정적 + tools/* + 교육글 slug). 검증: `/robots.txt`·`/sitemap.xml`.

### Phase E — 렌더링 전략 확정 (P5 대체, 네이티브)
- 정적/콘텐츠 route(`/`, `/tools/**`, 교육글, `/privacy`·`/terms`·`/about`): **기본 SSG**(빌드 시 정적 HTML).
- 데이터 route(news/macro/stock/gurus/calendar): v1은 client 패칭 유지 → 서버는 shell+메타. 필요 시 `export const revalidate`/ISR. (후속: RSC 서버 패칭으로 본문 SSR)
- 검증: `next build` 로그에 각 route 렌더 방식(Static/Dynamic) 확인, 콘텐츠 페이지 HTML에 본문 텍스트 존재.

### Phase F — AdSense 필수 부속 (P4)
- `app/privacy/page.tsx`·`app/terms/page.tsx`·`app/about/page.tsx`(SSG, 실제 콘텐츠 초안). 푸터에 링크 추가.
- **CMP(쿠키·광고 동의)**: 클라 컴포넌트 배너 + `gtag('consent', …)` consent mode 연동(EEA 대비). Google 인증 CMP 또는 경량 자체.
- `public/ads.txt`(승인 후 퍼블리셔 ID). 검증: 페이지·링크·동의 배너·consent 신호.

### Phase G — 콘텐츠: 계산기 + 교육 (P6)
- **투자 도구 허브** `app/tools/page.tsx`(카테고리별 카드 그리드, 각 계산기 1줄 설명) + **계산기별 페이지** `app/tools/<slug>/page.tsx`(SSG + metadata + "설명 + 계산기" 콘텐츠). 딥링크 가능.
- 계산기 로직은 순수 함수(프레임워크 무관)로 `src/domain/tools/calc.ts` **재작성**(롤백됨). 아래 §6 명세 사용.
- 계산기 12종(기존 2 + 신규 10): 물타기·불타기, 복리, 손실복구율, 목표가, 분할매수, 손절·익절(손익비), 포지션사이징, 해외주식양도세, 거래비용/손익분기, 적립식목표, 72법칙, 배당.
- 교육 글 몇 편(MDX 또는 정적 컴포넌트, SSG). 각 페이지 JSON-LD.
- 검증: `/tools/*` HTML에 설명 텍스트(SSG), 내부 링크.

### Phase H — 등록·검증 (P7)
- Search Console: 소유확인(metadata `verification` 태그 or DNS TXT) → sitemap 제출 → URL 검사.
- AdSense: 사이트 추가 → `ads.txt` → 광고 코드(`next/script`)/Auto ads(SPA성 라우트 전환 대응) → 승인 신청.
- Lighthouse/PageSpeed·Rich Results·모바일 친화성.

---

## 4. 반드시 대응할 함정 (착수 시 체크)
1. **`import.meta.env` → `process.env.NEXT_PUBLIC_*`**: 착수 시 `grep -rn "import.meta.env" src` 전수 치환. (Vite 전용 → Next 빌드 실패 원인)
2. **`window`/`document`/`localStorage` 모듈 최상위 접근**: zustand 스토어 init(usePageStore 제거되지만 useThemeStore·useCurrencyStore·usePortfolioEvalStore 등 persist)·analytics·theme apply가 SSR에서 터짐 → `typeof window !== 'undefined'` 가드 또는 클라 전용 실행(useEffect). zustand persist는 `skipHydration` 후 클라에서 `rehydrate()`.
3. **하이드레이션 미스매치**: 테마/updown/currency/language가 localStorage 기반 → 서버(기본값)·클라 불일치. 대응: `<html suppressHydrationWarning>` + 프리하이드레이션 인라인 스크립트로 attribute 선반영(§Phase B-2). 언어 의존 텍스트는 기본 ko로 SSR 후 클라 동기화(깜빡임 허용 최소화).
4. **recharts 등 클라 전용**: `next/dynamic` `{ ssr:false }`로 래핑(MacroLineChart·차트류·PriceMaChart). 차트가 SSR에서 터지지 않게.
5. **sonner Toaster·GTM·ExchangeRateBar**: 클라 컴포넌트. GTM은 `next/script` afterInteractive.
6. **Tailwind v4**: `@tailwindcss/vite` 제거 → PostCSS(`@tailwindcss/postcss`) 또는 Next 권장 방식. `@import "tailwindcss"` + cb-* 커스텀 프로퍼티·`[data-theme='light']`·`[data-updown='swap']` 변형이 그대로 동작하는지 확인(디자인 파리티 핵심).
7. **폰트**: 현재 CDN(pretendard, space grotesk) link. Next는 `next/font` 권장이나 파리티 위해 우선 `<link>` 유지 가능(CSP 없음). 추후 next/font 최적화.
8. **vercel.json rewrite 불필요**: Next가 라우팅 처리 → 만들지 않음(있으면 제거).
9. **feature flags**(`config/features.ts`): 그대로 유지(persona/stockAi 숨김). server/client 양쪽에서 import 가능(순수 상수).
10. **GA page_view**: SPA 수동 트래킹(`trackPageView`) → App Router에서는 `usePathname`+`useEffect`로 route 변경 감지 트래킹(클라 컴포넌트).

## 5. 파리티 검증 체크리스트 (Phase B·전체 완료 시)
- [ ] 모든 탭/페이지 시각 동일(다크·라이트 양쪽), 레이아웃·간격·색 토큰 동일
- [ ] 언어 ko/en/ja 토글, 테마·up/down 토글, 통화 — 새로고침 후에도 유지 + 플래시 없음
- [ ] 딥링크(`/macro`)·새로고침·뒤로/앞으로 정상
- [ ] 종목검색·차트·뉴스·거시·거장·캘린더 각 기능 동작(API 호출 동일)
- [ ] 종목 AI·내 종목 평가 **숨김 유지**(FEATURES)
- [ ] `next build` 무에러 + 각 route 렌더 방식 의도대로 + i18n parity 스크립트 통과
- [ ] view-source에 route별 메타(SSR), 콘텐츠 페이지 본문 포함

## 6. 계산기 로직 명세 (calc.ts 재작성용 — 롤백되어 재작성 필요, 순수 함수·상수만)
상수: `해외양도세율 0.22`, `해외양도 기본공제 2,500,000원`, `배당소득세 0.154`, `국내 거래세 0.18%`.
- `recoveryPct(loss%)` = loss/(100−loss)×100 (본전 필요 상승률). 0<loss<100.
- `stopTarget(buy, stop%, take%)` → {손절가 buy×(1−stop/100), 익절가 buy×(1+take/100), 손익비 take/stop}.
- `positionSize(계좌, 리스크%, 손절폭%)` → 최대손실=계좌×리스크%, 매수금액=최대손실/(손절폭%).
- `overseasTax(연실현손익)` → 과세=max(0, 손익−250만), 세금=과세×0.22, 실수령=손익−세금.
- `tradeCost(가, 수량, 수수료%, 거래세%)` → 왕복비용(매수수수료+매도수수료+매도거래세), 손익분기가=(매수액+왕복)/수량.
- `sipMonthly(목표, 년, 연%)` → 월적립 P = FV×r/((1+r)^n−1), r=연%/12/100, n=년×12 (r=0이면 목표/n).
- `rule72(연%)` = 72/연% (2배 기간).
- `dividend(수량, 주가, DPS)` → 세전=수량×DPS, 세후=세전×(1−0.154), 배당수익률=DPS/주가×100.
- `splitBuy(legs[{가,수량}])` → 총수량·총액·평단(총액/총수량).
- 기존 물타기·불타기(평단), 복리(초기+월적립·연%·년)는 현행 AveragingPage/CompoundPage 로직 재사용.

## 7. 안전/롤백
- 작업은 `feat/nextjs` 브랜치. main(현 Vite)은 검증 완료까지 건드리지 않음 → 문제 시 브랜치 폐기로 롤백.
- Vercel: 브랜치 프리뷰 배포로 실제 환경 파리티 확인 후 main 병합(프로덕션 승격).
- 커밋: Phase 단위, 사용자 확인 후(기존 규칙). 프로필 `yoonjae-isaac`.

## 8. 착수 순서 요약
A(스캐폴딩) → B(레이아웃·라우팅·파리티) → C(메타) → D(robots/sitemap) → E(렌더전략) → F(개인정보·CMP) → G(계산기·콘텐츠) → H(등록). B에서 **파리티 게이트**를 통과해야 다음 진행.
