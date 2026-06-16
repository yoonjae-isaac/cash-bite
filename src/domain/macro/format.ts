// 거시지표 값/날짜 포맷 헬퍼

/** 지표 값 — 단위에 무관하게 적당한 자릿수로 (천 단위 콤마, 큰 수는 compact) */
export function formatMacroValue(value: number | null): string {
  if (value === null) return '–';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(
      value
    );
  }
  // 소수 2자리까지, 정수면 콤마만
  return value.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

/** 변화율 — '+3.4%' / '-1.2%' (null 이면 '–') */
export function formatChange(pct: number | null): string {
  if (pct === null) return '–';
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

/** 변화율 부호 → 색 토큰 클래스 (상승 positive / 하락 negative / 0·null muted) */
export function changeColorClass(pct: number | null): string {
  if (pct === null || pct === 0) return 'text-cb-muted';
  return pct > 0 ? 'text-cb-positive' : 'text-cb-negative';
}

/** 빈도별 날짜 라벨 — monthly/quarterly 는 'YYYY.MM', daily 는 'YYYY.MM.DD' */
export function formatObsDate(date: string, frequency: string): string {
  const [y, m, d] = date.split('-');
  if (frequency === 'daily' || frequency === 'weekly') return `${y}.${m}.${d}`;
  if (frequency === 'annual') return y;
  return `${y}.${m}`;
}
