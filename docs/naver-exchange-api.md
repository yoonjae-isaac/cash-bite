# 네이버 모바일 환율 계산기 API (qapirender) — 참고 명세

CashBite 앱의 기본 환율 소스는 별도(Open Exchange 등)이며, 본 문서는 **네이버 모바일 검색 환율 위젯** 호출 규칙을 정리한 참고용입니다.

## 1. 엔드포인트 및 파라미터

**Base URL:** `https://m.search.naver.com/p/csearch/content/qapirender.nhn`

| 파라미터 | 역할 | 예시 값 | 비고 |
|----------|------|---------|------|
| `key` | 서비스 식별자 | `calculator` | 고정 |
| `pkid` | 결과 템플릿 ID | `141` | 환율 계산기 전용 |
| `q` | 검색 키워드 | `%ED%99%98%EC%9C%A8` | `환율` (URL Encoded) |
| `where` | 검색 맥락 | `m` | 모바일 검색 |
| `u1` | 정보 제공처 | `keb` | 하나은행(구 외환은행) 기준 |
| `u2` | 변환 금액 | `1` | 숫자 |
| `u3` | 기준 화폐 | `USD` | ISO 4217 |
| `u4` | 대상 화폐 | `KRW` | ISO 4217 |
| `u6` | 단위 표시 설정 | `standardUnit` | 고정 |
| `u7` | 소수점 처리 | `0` | 기본값 |
| `u8` | 화면 표시 방향 | `down` | 고정 |

## 2. 구현 위치 (레포지토리)

- URL 생성·호출: [`src/infrastructure/api/naverExchangeClient.ts`](../src/infrastructure/api/naverExchangeClient.ts) — `buildNaverExchangeRateUrl`, `fetchNaverExchangeRates` (USD→KRW·USD→JPY 병렬), `parseNaverExchangeCalculatorJson`
- 입력 타입: [`src/domain/exchange/naverConversionRequest.ts`](../src/domain/exchange/naverConversionRequest.ts)
- 에이전트 시스템 프롬프트: [`src/infrastructure/ai/naverExchangeCurrencyAgentPrompt.ts`](../src/infrastructure/ai/naverExchangeCurrencyAgentPrompt.ts)

## 3. 브라우저 호출

응답에 `Access-Control-Allow-Origin: *`가 포함되는 경우가 있어, 클라이언트에서 `fetch`로 호출할 수 있습니다.  
네이버 측 정책이 바뀔 수 있으므로, 장애 시에는 `FALLBACK_RATES` 등 보조 값을 쓰는 흐름을 유지합니다.

## 4. AI 에이전트 시스템 지시문

에이전트용 전문은 코드 상수 `NAVER_EXCHANGE_CURRENCY_AGENT_SYSTEM_INSTRUCTION`으로 관리합니다.  
자연어에서 금액·통화를 추출하고 URL을 만든 뒤, 응답을 파싱해 사용자에게 요약하도록 설계되어 있습니다.
