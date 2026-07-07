/**
 * 프론트 전용 기능 플래그 — 임시 미노출 토글.
 * 해당 값을 true 로 바꾸면 UI 진입점이 즉시 복구된다(백엔드/데이터는 건드리지 않음).
 */
export const FEATURES: { persona: boolean; stockAi: boolean } = {
  /** 내 종목 평가(거장 페르소나) 탭 */
  persona: false,
  /** 종목 분석의 AI 종합 분석 */
  stockAi: false,
};
