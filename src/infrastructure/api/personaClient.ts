import { backendGet, backendPost } from './backendClient';
import type { EvalHolding, PersonaSummary, PortfolioEvaluation } from '../../domain/persona/types';
import type { Language } from '../../domain/i18n/types';

/** 노출 거장 목록. */
export const fetchPersonas = (): Promise<PersonaSummary[]> =>
  backendGet<PersonaSummary[]>('/persona');

/** 내 포트폴리오를 거장 관점으로 평가 (매매 추천 없음). locale 로 평가 언어 지정. */
export const evaluatePortfolio = (
  key: string,
  holdings: EvalHolding[],
  locale: Language,
): Promise<PortfolioEvaluation> =>
  backendPost<PortfolioEvaluation>(`/persona/${encodeURIComponent(key)}/evaluate`, {
    holdings,
    locale,
  });
