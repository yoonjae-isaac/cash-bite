// 홈 사전 조회 묶음 — 홈에서 각 페이지로 유입시키기 위해 서버가 미리 채워 넘긴다.
// 항목별로 독립적으로 실패할 수 있어 전부 옵셔널이며, 없는 항목은 해당 섹션을 렌더하지 않는다.

import type { ArkTradeRow } from '../ark/types';
import type { CalEarning } from '../calendar/types';
import type { GuruOverviewItem, GuruStatStock } from '../guru/types';
import type { MacroOverviewRow } from '../macro/types';

export interface HomeData {
  /** 거장 요약 + 운용자산 상위 몇 명 (카드 프리뷰용) */
  guru?: {
    asOf: string;
    investorCount: number;
    topInvestors: GuruOverviewItem[];
  };
  /** 여러 거장이 함께 담은 종목 상위 (컨센서스 프리뷰용) */
  consensus?: {
    asOf: string;
    stocks: GuruStatStock[];
  };
  /** 이번 주 미국 실적 — 거장 보유 종목 우선 정렬 */
  earnings?: {
    from: string;
    to: string;
    items: CalEarning[];
    total: number;
    guruHeldTotal: number;
  };
  /** 티커 → 보유 거장 수 (실적 목록의 ★N 배지용) */
  guruSymbols?: Record<string, number>;
  /** 핵심 거시지표 */
  macro?: MacroOverviewRow[];
  /** 티커 → 로고 URL (프리뷰 목록 가독성용) */
  logos?: Record<string, string>;
  /**
   * ARK 최신 거래일 매매 — 13F(분기·최대 45일 지연)와 달리 당일 매매를 볼 수 있는 유일한 데이터라
   * 홈에서 따로 노출한다.
   */
  ark?: {
    tradeDate: string;
    buyCount: number;
    sellCount: number;
    trades: ArkTradeRow[];
  };
}
