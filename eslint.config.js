import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist: Vite 시절 산출물, .next: Next 빌드 산출물(생성된 타입·dev 번들까지 잡혀 노이즈가 된다).
  globalIgnores(['dist', '.next']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // react-hooks v7 의 React Compiler 계열 규칙. 현재 걸리는 8곳은 전부 마운트 시점 패턴으로,
      // SSR 에서 읽을 수 없는 값(localStorage 동의 여부)이나 등장 애니메이션·초기 로드처럼
      // 렌더 중 파생이 불가능한 것들이다. 만족시키려면 하이드레이션 구조를 바꿔야 해서 보류한다.
      // 서버 컴포넌트로 옮기는 리팩터링을 할 때 다시 켜서 하나씩 정리할 것.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
