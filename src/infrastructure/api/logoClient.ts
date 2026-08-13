import { backendGet } from './backendClient';

/**
 * 종목 로고 URL 배치 조회 — { 티커: URL }. 로고가 없는 종목은 키 자체가 없다.
 * 백엔드가 종목당 30일 캐시하므로 목록 화면마다 호출해도 외부 API 를 반복해 때리지 않는다.
 * 서버 컴포넌트에서 미리 받아 넘기면 이미지가 SSR 마크업에 함께 나간다.
 */
export const fetchStockLogos = (
  symbols: string[],
  revalidate?: number,
): Promise<Record<string, string>> => {
  const list = [...new Set(symbols.filter(Boolean))];
  if (list.length === 0) {
    return Promise.resolve({});
  }
  return backendGet<Record<string, string>>(
    `/stocks/logos?symbols=${encodeURIComponent(list.join(','))}`,
    revalidate,
  );
};
