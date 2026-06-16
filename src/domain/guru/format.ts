// 13F 수치 포맷 헬퍼
// value 단위: 2023-01 SEC 규칙 개정 이후 informationTable value 는 USD 달러 (구 규격은 천 달러)

/** USD → '$352.4B' 형태 */
export function formatUsd13F(usd: number): string {
  if (usd >= 1e12) return `$${(usd / 1e12).toFixed(2)}T`;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(1)}M`;
  if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`;
  return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/** 주식 수 → '9.0M' 컴팩트 표기 */
export function formatShares(shares: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    shares
  );
}

/** 발행사명 → 타이틀 케이스 (13F 는 대문자 고정이라 가독성 보정) */
export function formatIssuerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\b(Inc|Corp|Co|Ltd|Plc|Sa|Nv|Lp|Llc|Etf|Adr|Com|Cl|Del|New)\b/gi, (m) => {
      const upper = ['ETF', 'ADR', 'LLC', 'LP', 'PLC', 'SA', 'NV'];
      const u = m.toUpperCase();
      return upper.includes(u) ? u : m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
    });
}

/** 도넛/바 차트 공용 팔레트 — 블루 리드 (마지막 색은 '기타' 전용 회색) */
export const GURU_CHART_COLORS = [
  '#3182f6',
  '#22c55e',
  '#f59e0b',
  '#a78bfa',
  '#f04452',
  '#38bdf8',
  '#f97316',
  '#14b8a6',
] as const;

export const GURU_OTHERS_COLOR = '#9ca3af';
