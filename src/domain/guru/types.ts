// 투자 대가(거장) 13F 포트폴리오 — cash-bite-backend `/disclosure/13f/*` 응답 타입

export interface GuruInvestor {
  key: string; // 백엔드 FAMOUS_INVESTORS 키 (예: 'buffett')
  name: string; // 예: 'Berkshire Hathaway (Warren Buffett)'
  cik: string;
}

type GuruChangeType = 'new' | 'increased' | 'decreased' | 'unchanged';

export interface GuruHoldingChange {
  type: GuruChangeType;
  sharesDelta: number; // 직전 분기 대비 주식 수 증감
  sharesDeltaPct?: number; // 직전 분기 보유량 대비 % (type='new' 면 없음)
}

export interface GuruHolding {
  nameOfIssuer: string;
  titleOfClass: string;
  cusip: string;
  ticker?: string; // OpenFIGI 매핑 (상위 종목만, best-effort)
  value: number; // USD (2023-01 SEC 규칙 개정 이후 달러 단위)
  shares: number;
  weight: number; // totalValue 대비 % (소수 2자리)
  putCall?: 'Put' | 'Call';
  change?: GuruHoldingChange; // 직전 분기 비교 (백엔드 비교 실패 시 없음)
}

/** 직전 분기엔 있었지만 이번 분기에 사라진 종목 (전량 매도) */
export interface GuruExit {
  nameOfIssuer: string;
  titleOfClass: string;
  cusip: string;
  ticker?: string;
  prevShares: number;
  prevValue: number; // USD
  putCall?: 'Put' | 'Call';
}

export interface GuruPortfolio {
  investorKey?: string;
  investorName: string;
  cik: string;
  accessionNumber: string;
  filingDate: string; // YYYY-MM-DD
  reportDate: string; // 분기 기준일 YYYY-MM-DD
  form: string; // '13F-HR' | '13F-HR/A'
  totalValue: number; // USD
  positionCount: number;
  holdings: GuruHolding[]; // weight 내림차순
  prevReportDate?: string; // 비교 대상 직전 분기 기준일
  exits?: GuruExit[]; // 전량 매도 종목 (prevValue 내림차순)
}

/** 종목별 거장 상세 — 통계 말풍선용 (이름·보유액·변화) */
export interface GuruStatHolder {
  name: string; // 거장 인물명
  value: number; // 이 종목 보유 신고 가치 (USD); 전량매도(exit)는 0
  change: GuruChangeType | 'exit'; // 이번 분기 변화 유형
}

/** 크로스 투자자 집계 — 한 종목에 대한 거장 전체 통계 */
export interface GuruStatStock {
  cusip: string;
  ticker?: string;
  nameOfIssuer: string;
  holderCount: number; // 보유 거장 수
  totalValue: number; // 합산 신고 가치 (USD)
  buyerCount: number; // 이번 분기 신규/확대 거장 수
  sellerCount: number; // 이번 분기 축소/매도 거장 수
  holders?: GuruStatHolder[]; // 보유·매수·매도 거장 상세 (value 내림차순, exit 포함). 구 캐시 호환 위해 옵셔널
}

export interface GuruStats {
  asOf: string; // 대표 기준 분기 (YYYY-MM-DD)
  investorCount: number; // 집계 성공 투자자 수
  totalInvestors: number; // 전체 추적 대상 수
  mostHeld: GuruStatStock[];
  grandPortfolio: GuruStatStock[];
  mostBought: GuruStatStock[];
  mostSold: GuruStatStock[];
}

/** 'Berkshire Hathaway (Warren Buffett)' → { firm, person } 분리 */
export function splitInvestorName(name: string): { firm: string; person: string } {
  const match = name.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!match) return { firm: name, person: name };
  return { firm: match[1], person: match[2] };
}

/** reportDate(YYYY-MM-DD) → 'YYYY QN' */
export function toQuarterLabel(reportDate: string): string {
  const [year, month] = reportDate.split('-').map(Number);
  if (!year || !month) return reportDate;
  return `${year} Q${Math.ceil(month / 3)}`;
}
