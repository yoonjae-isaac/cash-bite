import type { Language } from '../i18n/types';
import type { StatementPeriod } from './types';

const DASH = '—';

const currencySymbol = (currency: string): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'KRW':
      return '₩';
    case 'JPY':
      return '¥';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return '';
  }
};

/**
 * 큰 금액 압축 표기 — 한국어는 만/억/조(1e4 단위), 그 외는 K/M/B/T(1e3 단위).
 * 재무제표 셀·시가총액에 사용. 통화 기호는 붙이지 않음(컬럼/헤더에서 통화 표기).
 */
export const formatCompact = (value: number | undefined, lang: Language): string => {
  if (value === undefined || !Number.isFinite(value)) return DASH;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (lang === 'ko') {
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`;
    if (abs >= 1e8) return `${sign}${Math.round(abs / 1e8).toLocaleString()}억`;
    if (abs >= 1e4) return `${sign}${Math.round(abs / 1e4).toLocaleString()}만`;
    return value.toLocaleString();
  }
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`;
  return value.toLocaleString();
};

/** 배수형 지표(PER/PBR/PSR/PEG) — 소수 2자리. */
export const formatRatio = (value: number | undefined): string => {
  if (value === undefined || !Number.isFinite(value)) return DASH;
  return value.toFixed(2);
};

/** 주당 금액·현재가(EPS/BPS/price) — 통화 기호 + 천단위. 1000 이상은 정수, 미만은 소수 2자리. */
export const formatMoney = (value: number | undefined, currency: string): string => {
  if (value === undefined || !Number.isFinite(value)) return DASH;
  const digits = Math.abs(value) >= 1000 ? 0 : 2;
  const body = value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${currencySymbol(currency)}${body}`;
};

/** 배당수익률 등 비율(fraction 0~1) → 퍼센트. */
export const formatPercent = (value: number | undefined): string => {
  if (value === undefined || !Number.isFinite(value)) return DASH;
  return `${(value * 100).toFixed(2)}%`;
};

/** 기간 컬럼 라벨 — 연간은 'YYYY', 분기는 'YYYY.MM'(기간 종료월). */
export const formatPeriodLabel = (date: string, period: StatementPeriod): string => {
  if (!date) return DASH;
  const [y, m] = date.split('-');
  return period === 'annual' ? y : `${y}.${m}`;
};
