# 🍏 Project Vision & Concept: CashBite

이 문서는 'CashBite' 애플리케이션의 핵심 정체성, 비전, 그리고 달성하고자 하는 목표를 정의합니다. AI 에이전트는 기능 구현 및 UI 설계 시 이 문서의 철학을 반드시 반영해야 합니다.

## 1. Project Identity (정체성)
- **App Name:** CashBite (캐시바이트)
- **Tagline:** "당신의 현금흐름을 가장 가볍고 빠르게, 한 입(Bite) 베어 물다."
- **Core Concept:** 서버나 데이터베이스 없이(No-DB) 브라우저와 Open API만으로 동작하는 초경량 클라이언트 사이드 배당금 계산 및 포트폴리오 관리 앱.

## 2. Core Vision & Philosophy (비전과 철학)
CashBite는 **'무거움의 탈피'**를 지향합니다. 
복잡한 회원가입, 무거운 백엔드 서버 연동, 불필요한 데이터 수집을 배제합니다. 사용자가 앱을 여는 순간 즉각적으로 자신의 자산 흐름(배당금)을 파악하고, 마치 경쾌한 음악을 듣는 것처럼 투자 수익을 시각적으로 즐길 수 있도록 돕는 것이 이 프로젝트의 존재 이유입니다.

## 3. Key Objectives (핵심 목표)

### 3.1. Zero-Backend Architecture (완전한 클라이언트 사이드)
- 데이터 영속성은 오직 브라우저의 `LocalStorage`에 의존합니다.
- 외부 데이터(주가, 배당금, 환율)는 서버를 거치지 않고 프론트엔드에서 `Finnhub API` 등 무료 Open API를 직접 호출하여 해결합니다.
- 유지보수 비용(서버비) '0원'을 달성하며, 정적 호스팅(Vercel, Netlify 등)만으로 글로벌 배포가 가능해야 합니다.

### 3.2. 실시간 글로벌 금융 데이터 통합
- 미국 주식(USD) 배당금을 기반으로 하되, 실시간 환율 API를 연동하여 원화(KRW) 및 엔화(JPY) 투자자 모두가 직관적으로 수익을 파악할 수 있는 다중 통화 대시보드를 제공합니다.

### 3.3. 즉각적인 상호작용 (Instant Feedback)
- 주식 수량을 수정하거나 새로운 종목을 추가할 때, 새로고침 없이 즉각적으로 총수익과 예상 세후 배당금이 화면에 업데이트되어야 합니다.

## 4. Target Audience (타겟 사용자)
- 미국 배당주(예: SCHD, O 등)를 모아가는 한국 및 일본의 개인 투자자.
- 복잡한 엑셀 시트 대신, 스마트폰이나 웹에서 가볍고 예쁜 UI로 매월/매년 들어오는 현금흐름을 확인하고 동기부여를 얻고 싶은 사람.

## 5. UI/UX Design Principles (디자인 원칙)
- **Vibe:** 트렌디(Trendy), 경쾌함(Bouncy), 산뜻함(Fresh).
- **Color Palette:** - `Primary`: 신뢰감과 안정을 주는 **Deep Blue**.
  - `Accent/Point`: 긍정적인 수익과 '현금(Cash)'을 상징하는 산뜻한 **Mint Green** (또는 Apple Green).
- **Component Style:** - 모서리가 둥근(Rounded) 부드러운 카드 디자인.
  - 정보를 빼곡하게 채우기보다, 여백(Margin/Padding)을 충분히 주어 한눈에 정보가 들어오도록 설계.
- **Interactions:** - 상태 변화 시 부드러운 트랜지션(Tailwind `transition-all`, `duration-300` 등 활용) 적용.
  - 성공/실패 등의 피드백은 가벼운 Toast 메시지로 전달.

## 6. AI Agent Guidelines (AI 에이전트 행동 지침)
- **개발 우선순위:** 복잡도보다 '가벼움과 속도'를 우선합니다. 무거운 외부 라이브러리 추가는 지양합니다.
- **UI 구현:** 이 문서의 '디자인 원칙'을 읽고, Tailwind CSS를 활용해 별도의 구체적인 지시가 없더라도 딥 블루와 민트 그린을 포인트로 한 세련된 UI를 스스로 제안하고 구현하세요.
- **아키텍처 준수:** 본 비전을 달성하기 위해 동봉된 `AI_RULES.md`의 Clean Architecture 패턴을 엄격히 따르세요.