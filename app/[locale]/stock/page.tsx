import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import StockPage from '@/views/StockPage';
import { setRequestLocale } from 'next-intl/server';
import { staticPageMetadata, type Locale } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata('/stock', locale as Locale);
}

// 종목 분석은 검색형(기본 데이터 없음)이라 정적 설명을 서버 렌더해 SSR 콘텐츠·SEO 확보(주린이용 원본, 3개국).
type Term = { term: string; short: string; desc: string };
type Guide = { title: string; intro: string; outro: string; terms: Term[] };

const GUIDE: Record<Locale, Guide> = {
  ko: {
    title: '지표 읽는 법',
    intro:
      '종목 분석에서는 국내·미국 주식의 밸류에이션·수익성·기술적 지표를 한 화면에서 봅니다. 처음이라면 아래 기초 지표부터 익혀 보세요.',
    outro:
      '지표는 참고용이며 단일 지표만으로 투자 판단을 하기보다 여러 지표와 기업 상황을 함께 보는 것이 좋습니다.',
    terms: [
      { term: 'PER', short: '주가수익비율', desc: '주가가 주당순이익(EPS)의 몇 배인지. 낮을수록 이익 대비 저평가 경향이지만 업종별로 기준이 다릅니다.' },
      { term: 'PBR', short: '주가순자산비율', desc: '주가가 주당순자산의 몇 배인지. 1보다 낮으면 장부상 순자산보다 싸게 거래된다는 의미입니다.' },
      { term: 'EPS', short: '주당순이익', desc: '기업이 1주당 벌어들인 순이익. 늘어나는 추세인지가 중요합니다.' },
      { term: '배당수익률', short: 'Dividend Yield', desc: '주가 대비 연간 배당금 비율. 주가가 내리면 올라가고, 세후 실수령은 배당소득세 15.4%를 반영해 봐야 합니다.' },
      { term: '시가총액', short: 'Market Cap', desc: '주가 × 총 발행 주식 수 = 기업 전체의 시장 가치. 규모(대형·중소형)를 가늠하는 기준입니다.' },
      { term: '이동평균선', short: 'MA', desc: '최근 N일 종가의 평균을 이은 선. 5·20·60·120일선으로 단기~장기 추세를 봅니다.' },
      { term: '골든/데드크로스', short: 'Cross', desc: '단기 이동평균선이 장기선을 위로 뚫으면 골든크로스(강세 신호), 아래로 뚫으면 데드크로스(약세 신호)로 해석합니다.' },
      { term: 'RSI', short: '상대강도지수', desc: '최근 상승·하락 강도를 0~100으로 나타낸 지표. 통상 70 이상 과매수, 30 이하 과매도로 봅니다.' },
    ],
  },
  en: {
    title: 'How to read the indicators',
    intro:
      'Stock analysis shows valuation, profitability, and technical indicators for Korean and U.S. stocks on one screen. If you’re new, start with the basics below.',
    outro:
      'Indicators are for reference. Rather than deciding on a single metric, it’s better to weigh several indicators alongside the company’s situation.',
    terms: [
      { term: 'PER', short: 'Price/Earnings', desc: 'How many times earnings per share (EPS) the price is. Lower tends to mean cheaper relative to earnings, but the benchmark differs by sector.' },
      { term: 'PBR', short: 'Price/Book', desc: 'How many times book value per share the price is. Below 1 means it trades cheaper than its net assets on the books.' },
      { term: 'EPS', short: 'Earnings per share', desc: 'Net profit earned per share. Whether it’s trending up matters most.' },
      { term: 'Dividend Yield', short: 'Yield', desc: 'Annual dividend relative to price. It rises when the price falls; after-tax take-home reflects the 15.4% dividend tax.' },
      { term: 'Market Cap', short: 'Size', desc: 'Price × total shares outstanding = the company’s total market value. A gauge of size (large vs. small/mid cap).' },
      { term: 'Moving Average', short: 'MA', desc: 'A line connecting the average of the last N closing prices. The 5/20/60/120-day lines show short- to long-term trends.' },
      { term: 'Golden/Dead Cross', short: 'Cross', desc: 'When a short MA crosses above a long MA it’s a golden cross (bullish); crossing below is a dead cross (bearish).' },
      { term: 'RSI', short: 'Relative Strength Index', desc: 'Recent up/down strength on a 0–100 scale. Typically above 70 is overbought, below 30 oversold.' },
    ],
  },
  ja: {
    title: '指標の読み方',
    intro:
      '銘柄分析では、韓国・米国株のバリュエーション・収益性・テクニカル指標を1画面で見ます。初めてなら下の基礎指標から覚えましょう。',
    outro:
      '指標は参考用です。単一の指標だけで判断するより、複数の指標と企業の状況を合わせて見るのがよいでしょう。',
    terms: [
      { term: 'PER', short: '株価収益率', desc: '株価が1株当たり純利益（EPS）の何倍か。低いほど利益に対して割安の傾向ですが、業種ごとに基準が異なります。' },
      { term: 'PBR', short: '株価純資産倍率', desc: '株価が1株当たり純資産の何倍か。1より低ければ帳簿上の純資産より安く取引されている意味です。' },
      { term: 'EPS', short: '1株当たり純利益', desc: '企業が1株当たりに稼いだ純利益。増加傾向かどうかが重要です。' },
      { term: '配当利回り', short: 'Dividend Yield', desc: '株価に対する年間配当の比率。株価が下がると上がり、税引後手取りは配当所得税15.4%を反映して見ます。' },
      { term: '時価総額', short: 'Market Cap', desc: '株価 × 発行済株式数 = 企業全体の市場価値。規模（大型・中小型）を測る基準です。' },
      { term: '移動平均線', short: 'MA', desc: '直近N日の終値の平均を結んだ線。5・20・60・120日線で短期〜長期のトレンドを見ます。' },
      { term: 'ゴールデン/デッドクロス', short: 'Cross', desc: '短期移動平均線が長期線を上抜けるとゴールデンクロス（強気）、下抜けるとデッドクロス（弱気）と解釈します。' },
      { term: 'RSI', short: '相対力指数', desc: '直近の上昇・下落の強さを0〜100で示す指標。通常70以上で買われすぎ、30以下で売られすぎと見ます。' },
    ],
  },
};

function StockGuide({ locale }: { locale: Locale }) {
  const g = GUIDE[locale];
  return (
    <section className="mt-4">
      <h2 className="text-lg font-bold text-cb-foreground mb-1.5">{g.title}</h2>
      <p className="text-sm text-cb-muted mb-4 leading-relaxed">{g.intro}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {g.terms.map((t) => (
          <div key={t.term} className="glass-panel p-4">
            <dt className="font-bold text-cb-foreground">
              {t.term}
              <span className="ml-1.5 text-xs font-medium text-cb-muted">{t.short}</span>
            </dt>
            <dd className="mt-1 text-[13.5px] text-cb-muted leading-relaxed">{t.desc}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[11px] text-cb-muted/70 leading-relaxed">{g.outro}</p>
    </section>
  );
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = ((raw as Locale) in GUIDE ? (raw as Locale) : 'ko') as Locale;
  return (
    <Reveal>
      <StockPage />
      <StockGuide locale={locale} />
    </Reveal>
  );
}
