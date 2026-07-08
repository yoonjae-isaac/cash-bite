import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import StockPage from '../../src/views/StockPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '종목 분석',
  description: '국내·미국 주식의 재무·기술적 지표를 한눈에 분석합니다. PER·PBR·RSI·이동평균 등 기초 지표 설명 포함.',
  path: '/stock',
});

// 종목 분석은 검색형(기본 데이터 없음)이라 정적 설명을 서버 렌더해 SSR 콘텐츠·SEO 확보(주린이용 원본).
const TERMS: { term: string; short: string; desc: string }[] = [
  { term: 'PER', short: '주가수익비율', desc: '주가가 주당순이익(EPS)의 몇 배인지. 낮을수록 이익 대비 저평가 경향이지만 업종별로 기준이 다릅니다.' },
  { term: 'PBR', short: '주가순자산비율', desc: '주가가 주당순자산의 몇 배인지. 1보다 낮으면 장부상 순자산보다 싸게 거래된다는 의미입니다.' },
  { term: 'EPS', short: '주당순이익', desc: '기업이 1주당 벌어들인 순이익. 늘어나는 추세인지가 중요합니다.' },
  { term: '배당수익률', short: 'Dividend Yield', desc: '주가 대비 연간 배당금 비율. 주가가 내리면 올라가고, 세후 실수령은 배당소득세 15.4%를 반영해 봐야 합니다.' },
  { term: '시가총액', short: 'Market Cap', desc: '주가 × 총 발행 주식 수 = 기업 전체의 시장 가치. 규모(대형·중소형)를 가늠하는 기준입니다.' },
  { term: '이동평균선', short: 'MA', desc: '최근 N일 종가의 평균을 이은 선. 5·20·60·120일선으로 단기~장기 추세를 봅니다.' },
  { term: '골든/데드크로스', short: 'Cross', desc: '단기 이동평균선이 장기선을 위로 뚫으면 골든크로스(강세 신호), 아래로 뚫으면 데드크로스(약세 신호)로 해석합니다.' },
  { term: 'RSI', short: '상대강도지수', desc: '최근 상승·하락 강도를 0~100으로 나타낸 지표. 통상 70 이상 과매수, 30 이하 과매도로 봅니다.' },
];

function StockGuide() {
  return (
    <section className="mt-4">
      <h2 className="text-lg font-bold text-cb-foreground mb-1.5">지표 읽는 법</h2>
      <p className="text-sm text-cb-muted mb-4 leading-relaxed">
        종목 분석에서는 국내·미국 주식의 밸류에이션·수익성·기술적 지표를 한 화면에서 봅니다. 처음이라면 아래
        기초 지표부터 익혀 보세요.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TERMS.map((t) => (
          <div key={t.term} className="glass-panel p-4">
            <dt className="font-bold text-cb-foreground">
              {t.term}
              <span className="ml-1.5 text-xs font-medium text-cb-muted">{t.short}</span>
            </dt>
            <dd className="mt-1 text-[13.5px] text-cb-muted leading-relaxed">{t.desc}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[11px] text-cb-muted/70 leading-relaxed">
        지표는 참고용이며 단일 지표만으로 투자 판단을 하기보다 여러 지표와 기업 상황을 함께 보는 것이
        좋습니다.
      </p>
    </section>
  );
}

export default function Page() {
  return (
    <Reveal>
      <StockPage />
      <StockGuide />
    </Reveal>
  );
}
