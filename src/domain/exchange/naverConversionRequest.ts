/**
 * 네이버 모바일 환율 계산기(qapirender) URL 생성에 필요한 입력.
 * 통화 코드는 ISO 4217 형태(예: USD, KRW)를 권장합니다.
 */
export interface NaverExchangeConversionInput {
  amount: number;
  sourceCurrencyCode: string;
  targetCurrencyCode: string;
}
