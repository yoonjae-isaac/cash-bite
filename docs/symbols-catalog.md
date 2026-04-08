# 정적 심볼 카탈로그

- **파일**: `public/symbols.json` — Vite 기준 루트 URL `/symbols.json`으로 제공됩니다.
- **형식**: JSON 배열의 배열만 허용합니다. 각 행은 `[티커, 표시명]` 입니다.

```json
[["AAPL","Apple Inc."],["005930","삼성전자"]]
```

- **생성**: `pnpm run build:symbols`는 `scripts/build-symbols.mjs`를 실행합니다. 현재는 샘플 데이터를 쓰는 뼈대이며, CSV나 공개 API 등으로 교체해 대량 목록을 생성하면 됩니다. 외부 API·약관·키 관리는 팀 정책에 맞게 별도 검토하세요.

- **앱 동작**: 티커 입력란 포커스 또는 첫 글자 입력 시 한 번만 fetch·캐시되고, Fuse.js로 로컬 퍼지 검색합니다. fetch 실패 시 자동완성만 비활성화되고 수동 입력은 그대로입니다.
