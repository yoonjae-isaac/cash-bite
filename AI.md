Markdown
# AI Agent Development Guidelines & Clean Architecture Rules

이 문서는 본 프로젝트의 아키텍처 원칙과 코딩 컨벤션을 정의합니다. AI 에이전트는 코드를 생성, 수정, 리팩토링할 때 반드시 이 문서의 규칙을 최우선으로 준수해야 합니다.

## 1. Architecture: Frontend Clean Architecture
이 앱은 비즈니스 로직과 UI를 완벽하게 분리하여 엔터프라이즈 서비스로 확장 가능하도록 설계되었습니다. 모든 코드는 다음 4개의 계층(Layer)으로 철저히 분리되어야 합니다. 단방향 의존성(Presentation -> Application -> Domain <- Infrastructure)을 유지하세요.

### 1.1. Directory Structure
```text
src/
 ├── domain/         # [Core] 순수 비즈니스 로직, 타입, 엔티티 (외부 의존성 X)
 ├── infrastructure/ # [Data] 외부 API 통신, LocalStorage, 3rd Party 라이브러리 어댑터
 ├── application/    # [State] 상태 관리(Zustand), UseCase (Domain과 Infrastructure 연결)
 ├── presentation/   # [UI] React 컴포넌트, 페이지, 스타일 (Tailwind)
 └── shared/         # 공통 유틸리티, 상수, 공통 UI 컴포넌트 (버튼, 인풋 등)
1.2. 계층별 책임 (Layer Responsibilities)
Domain Layer: 순수 TypeScript로만 작성됩니다. React나 외부 라이브러리(Zustand 등)에 의존하지 않습니다. (예: StockEntity, 배당금 계산 순수 함수)

Infrastructure Layer: fetch 로직, 브라우저 API(localStorage) 접근 로직이 위치합니다. Presentation 계층에서 이를 직접 호출해서는 안 됩니다.

Application Layer: 상태를 관리하고 비즈니스 흐름을 제어합니다. Zustand Store와 Custom Hooks(useDividendPortfolio)가 여기에 위치합니다.

Presentation Layer: 데이터의 '표현'만 담당합니다. 상태를 변경하는 비즈니스 로직은 반드시 Application 계층의 Hook을 호출하여 처리합니다.

2. Refactoring & Coding Rules
AI 에이전트는 다음의 리팩토링 규칙을 엄격하게 적용하여 코드를 작성합니다.

2.1. React Components (Presentation Layer)
View와 Logic의 분리: 컴포넌트 내부에 복잡한 상태 변경 로직이나 계산 로직을 두지 마세요. 모든 로직은 use[Feature]ViewModel 형태의 Custom Hook으로 추출하여 Application 계층에 둡니다. (Container/Presentational 패턴 적용)

Props 개수 제한: 단일 컴포넌트의 Props는 최대 4개를 넘지 않도록 설계하세요. 넘는 경우 도메인 객체로 묶어서 전달하세요.

단일 책임 원칙 (SRP): 한 컴포넌트가 100라인(UI 코드 기준)을 초과하면 더 작은 컴포넌트로 분리할 수 있는지 확인하세요.

2.2. TypeScript & Type Safety
명시적 타이핑: any 타입 사용을 절대 금지합니다. 모든 함수의 매개변수와 반환 타입은 명시적으로 작성하세요.

Interface vs Type: 객체의 형태를 정의할 때는 interface를 사용하고, 유니온이나 유틸리티 타입이 필요할 때는 type을 사용하세요.

도메인 모델 맵핑: API의 응답 형태(DTO)를 그대로 UI에서 사용하지 마세요. 반드시 Infrastructure 계층에서 Domain Entity로 변환(Mapper)하여 반환하세요.

2.3. State Management (Application Layer)
Zustand Store는 비대한 단일 객체가 되지 않도록 도메인별로 분리하세요 (예: useStockStore, useAuthStore).

Store 내부의 Action 함수는 직접 외부 API(fetch)를 호출하지 않습니다. Infrastructure 계층의 API 호출 함수를 주입받거나 import하여 사용하세요.

2.4. Magic Numbers & Hardcoding
컴포넌트 내부나 계산 로직에 매직 넘버(예: 0.85, 1350)를 직접 쓰지 마세요.

반드시 src/domain/constants/ 디렉토리에 의미 있는 상수로 선언하여 사용하세요. (예: TAX_RATE_US_DIVIDEND = 0.15)

3. Git & PR 지침 (AI Agent Action List)
작업을 수행할 때 다음 절차를 따르세요.

분석: 요구사항을 읽고 위 아키텍처 중 어느 계층을 수정해야 하는지 먼저 선언하세요.

도메인 우선 개발: 새로운 기능이 추가될 경우 domain (타입, 상수) -> infrastructure -> application -> presentation 순서로 코드를 작성하세요.

자체 리뷰: 코드 작성이 끝나면 이 문서의 규칙(의존성 방향, View/Logic 분리, 매직 넘버 등)을 스스로 검토하고 결과를 주석으로 남기세요.