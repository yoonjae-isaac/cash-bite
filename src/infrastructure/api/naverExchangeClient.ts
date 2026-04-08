import type { NaverExchangeConversionInput } from '../../domain/exchange/naverConversionRequest';

/** 네이버 모바일 검색 환율 계산기 qapirender 엔드포인트 */
export const NAVER_EXCHANGE_QAPI_BASE =
  'https://m.search.naver.com/p/csearch/content/qapirender.nhn' as const;

/** qapirender JSON 본문 (하나은행 기준 환율 위젯). */
interface NaverExchangeCountryItem {
  value?: string;
  subValue?: string;
  currencyUnit?: string;
}

interface NaverExchangeCalculatorJson {
  pkid?: number;
  country?: NaverExchangeCountryItem[];
  calculatorMessage?: string;
}

/**
 * 1 u3 통화를 u4 통화로 환산한 결과 중, 대상 통화 쪽 숫자(예: 1 USD → KRW 금액).
 * `country[1].value`가 변환 결과입니다.
 */
export function parseNaverExchangeCalculatorJson(text: string): number | null {
  let data: NaverExchangeCalculatorJson;
  try {
    data = JSON.parse(text) as NaverExchangeCalculatorJson;
  } catch {
    return null;
  }
  const items = data.country;
  if (!Array.isArray(items) || items.length < 2) return null;
  const target = items[1];
  const raw = target?.value?.replace(/,/g, '').trim() ?? '';
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * 고정 쿼리 파라미터 (문서 정의와 동일).
 * - key: calculator, pkid: 141, q: 환율, where: m, u1: keb, u6: standardUnit, u7: 0, u8: down
 * - 가변: u2 금액, u3 기준 통화, u4 대상 통화
 */
export function buildNaverExchangeRateUrl(
  input: NaverExchangeConversionInput
): string {
  const u3 = input.sourceCurrencyCode.trim().toUpperCase();
  const u4 = input.targetCurrencyCode.trim().toUpperCase();
  const u2 = String(input.amount);

  const params = new URLSearchParams({
    key: 'calculator',
    pkid: '141',
    q: '환율',
    where: 'm',
    u1: 'keb',
    u2,
    u3,
    u4,
    u6: 'standardUnit',
    u7: '0',
    u8: 'down',
  });

  return `${NAVER_EXCHANGE_QAPI_BASE}?${params.toString()}`;
}

export interface NaverExchangeRatesPartial {
  KRW?: number;
  JPY?: number;
}

async function fetchOneRate(
  source: string,
  target: string
): Promise<number | null> {
  const url = buildNaverExchangeRateUrl({
    amount: 1,
    sourceCurrencyCode: source,
    targetCurrencyCode: target,
  });
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  return parseNaverExchangeCalculatorJson(text);
}

/**
 * USD 기준 1달러당 KRW·JPY 환율(하나은행 기준)을 네이버 qapirender에서 가져옵니다.
 * 한쪽만 성공해도 해당 키만 채웁니다.
 */
export async function fetchNaverExchangeRates(): Promise<NaverExchangeRatesPartial> {
  const [krw, jpy] = await Promise.all([
    fetchOneRate('USD', 'KRW'),
    fetchOneRate('USD', 'JPY'),
  ]);
  const out: NaverExchangeRatesPartial = {};
  if (krw != null) out.KRW = krw;
  if (jpy != null) out.JPY = jpy;
  return out;
}
