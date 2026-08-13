// 투자 대가(거장) 13F 포트폴리오 — cash-bite-backend `/disclosure/13f/*` 응답 타입

export interface GuruInvestor {
  key: string; // 백엔드 FAMOUS_INVESTORS 키 (예: 'buffett')
  name: string; // 예: 'Berkshire Hathaway (Warren Buffett)'
  cik: string;
}

export type GuruChangeType = 'new' | 'increased' | 'decreased' | 'unchanged';

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
  holderDelta?: number; // 직전 분기 대비 보유 거장 수 증감 (직전 스냅샷이 있을 때만)
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

/** 투자자 카드 1장 — /disclosure/13f/overview */
export interface GuruOverviewItem {
  key?: string; // 백엔드 FAMOUS_INVESTORS 키
  name: string;
  cik: string;
  reportDate: string;
  totalValue: number; // USD
  positionCount: number;
  topHolding?: { nameOfIssuer: string; ticker?: string; weight: number };
  newCount: number; // 신규 편입 종목 수
  exitCount: number; // 전량 매도 종목 수
  // 아래 둘과 GuruOverview.filing 은 백엔드 선반영 전 응답에는 없다(배포 시차). 없으면 표시를 생략한다.
  quartersBehind?: number; // 대표 분기 기준 몇 분기 뒤처졌는지 (0 = 최신 반영)
  isStale?: boolean; // 여러 분기째 신규 공시 없음
}

/** 분기별 공시 반영 현황 — "N명 중 몇 명이 이번 분기를 냈나" */
export interface GuruFilingStatus {
  asOf: string; // 집계 대표 분기
  latestQuarter: string; // 적재분 중 가장 최근 분기
  asOfCount: number;
  latestCount: number;
  totalInvestors: number;
  staleCount: number;
  quarters: Array<{ reportDate: string; count: number }>;
}

export interface GuruOverview {
  asOf: string;
  investors: GuruOverviewItem[]; // 운용자산 내림차순
  filing?: GuruFilingStatus;
}

/** 종목을 보유한 거장 1명 — /disclosure/13f/symbol/:symbol */
export interface GuruSymbolHolder {
  investorKey?: string;
  investorName: string;
  reportDate: string;
  weight: number; // 해당 거장 포트폴리오 내 비중 %
  value: number; // USD
  shares: number;
  changeType?: GuruChangeType;
}

export interface GuruSymbolHolders {
  symbol: string;
  asOf: string;
  totalInvestors: number;
  holderCount: number;
  totalValue: number;
  holders: GuruSymbolHolder[]; // 비중 내림차순
  exitedNames: string[]; // 이번 분기 전량 매도한 거장 인물명
}

/** 거장 보유 티커 → 보유 거장 수 — /disclosure/13f/held-symbols */
export interface GuruHeldSymbols {
  asOf: string;
  symbols: Record<string, number>;
}

/** 거장 동향 AI 요약 — /disclosure/13f/analysis */
export interface GuruAnalysis {
  scope: 'INVESTOR' | 'MARKET';
  subjectKey: string;
  reportDate: string;
  summary: string;
  model?: string;
  generatedAt: string;
}

/**
 * 거장 개별 리포트 본문 분해 — 백엔드 프롬프트 계약상 첫 문단이 제목.
 * 계약이 깨진 응답(제목이 길거나 문단 구분 없음)은 전체를 본문으로 폴백한다.
 */
export function splitAnalysis(summary: string): { headline?: string; body: string } {
  const trimmed = summary.trim();
  const [first, ...rest] = trimmed.split(/\n\s*\n/);
  if (rest.length === 0 || first.length > 60 || first.includes('\n')) {
    return { body: trimmed };
  }
  return { headline: first.replace(/^#+\s*/, ''), body: rest.join('\n\n') };
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
