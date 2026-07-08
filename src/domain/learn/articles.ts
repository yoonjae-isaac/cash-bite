// 학습 게시판 원본 콘텐츠 — 표시 전용(글쓰기/댓글/수정은 이후). 한국어 원본(정책 페이지와 동일 정책).
// 본문은 구조화 블록(MDX 불필요). p 텍스트의 **...** 는 강조로 렌더.

export type LearnCategory = 'basic' | 'trade' | 'asset' | 'div' | 'guru';

export const LEARN_CATEGORIES: LearnCategory[] = ['basic', 'trade', 'asset', 'div', 'guru'];
export const LEARN_CATEGORY_LABEL: Record<LearnCategory, string> = {
  basic: '기초',
  trade: '매매',
  asset: '자산배분',
  div: '배당',
  guru: '거장',
};
export const LEARN_CATEGORY_COLOR: Record<LearnCategory, string> = {
  basic: '#5b8def',
  trade: '#22c55e',
  asset: '#f5a623',
  div: '#fb7185',
  guru: '#a78bfa',
};

/** 헤더 nav 라벨(다국어). 본문은 ko 전용이지만 탭 라벨은 3개국. */
export const LEARN_NAV = { ko: '학습', en: 'Learn', ja: '学習' };

export type ArticleBlock =
  | { type: 'lead'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'callout'; text: string }
  | { type: 'ul'; items: string[] };

export interface RelatedTool {
  slug: string;
  label: string;
}

export interface Article {
  slug: string;
  category: LearnCategory;
  title: string;
  excerpt: string;
  readMin: number;
  date: string;
  featured?: boolean;
  relatedTools?: RelatedTool[];
  body: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'averaging-down-up',
    category: 'trade',
    title: '물타기 vs 불타기, 언제 어떻게 해야 할까',
    excerpt:
      '내려서 더 사는 물타기, 올라서 더 사는 불타기. 평단이 어떻게 바뀌는지, 그리고 해도 되는 순간과 하면 안 되는 순간을 가른다.',
    readMin: 6,
    date: '2026.07.08',
    featured: true,
    relatedTools: [
      { slug: 'averaging', label: '물타기·불타기 평단 계산기' },
      { slug: 'position-size', label: '포지션 사이징 계산기' },
    ],
    body: [
      { type: 'lead', text: '주가가 내렸을 때 더 사서 평단을 낮추는 ‘물타기’, 올랐을 때 더 사서 비중을 키우는 ‘불타기’. 둘 다 평균 단가를 바꾸는 행동이지만, 목적과 조건이 완전히 다릅니다.' },
      { type: 'h2', text: '물타기 — 평단을 낮추는 추가 매수' },
      { type: 'p', text: '보유 종목이 하락했을 때 추가로 매수하면 평균 매수 단가(평단)가 내려갑니다. 10주를 10만원에 샀는데 8만원에 10주를 더 사면 평단은 9만원이 되죠. 본전까지 필요한 상승 폭이 줄어드는 게 장점입니다.' },
      { type: 'p', text: '문제는 **‘왜 사는가’**입니다. 단지 싸졌다는 이유로 계속 사면, 하락하는 종목에 계좌가 집중되는 위험이 커집니다.' },
      { type: 'callout', text: '**핵심** — 물타기는 ‘싸져서’가 아니라 ‘여전히 좋아서’ 사는 것입니다. 투자 아이디어가 훼손됐다면, 평단을 낮출 게 아니라 계획대로 손절할 때입니다.' },
      { type: 'h2', text: '불타기 — 오를 때 비중을 키우는 것' },
      { type: 'p', text: '반대로 상승 추세에서 추가 매수하면 평단은 올라가지만, 이기고 있는 포지션의 비중을 키우는 전략입니다. 추세추종 관점에서 자주 쓰이며, 대신 이미 오른 가격에 사므로 손절 라인 관리가 더 중요해집니다.' },
      { type: 'h2', text: '하기 전에 확인할 3가지' },
      { type: 'ul', items: [
        '이 종목을 **지금 처음 본다면**, 그래도 살 만한가? (아니라면 물타기 근거도 약하다)',
        '추가 매수 후 이 종목이 계좌에서 차지하는 **비중**은 얼마인가?',
        '틀렸을 때 **어디서 손절**할지 미리 정해뒀는가?',
      ] },
      { type: 'h2', text: '숫자로 계산해 보기' },
      { type: 'p', text: '추가 매수 후 평단이 정확히 얼마가 되는지, 계좌 대비 적정 매수 금액은 얼마인지는 감이 아니라 계산으로 정하는 편이 안전합니다. 아래 계산기로 바로 확인해 보세요.' },
    ],
  },
  {
    slug: 'before-you-start',
    category: 'basic',
    title: '주식 시작 전, 꼭 아는 5가지',
    excerpt: '계좌·수수료·세금·분산·기록. 첫 매수 전에 5분만 읽으면 실수를 크게 줄일 수 있는 기본기.',
    readMin: 5,
    date: '2026.07.07',
    relatedTools: [
      { slug: 'trade-cost', label: '거래비용·손익분기 계산기' },
      { slug: 'overseas-tax', label: '해외주식 양도세 계산기' },
    ],
    body: [
      { type: 'lead', text: '투자는 종목을 고르기 전에 ‘구조’를 아는 데서 시작합니다. 첫 매수 전에 알아두면 좋은 다섯 가지를 정리했습니다.' },
      { type: 'h2', text: '1. 거래에는 비용이 든다' },
      { type: 'p', text: '살 때·팔 때 증권사 수수료가, 팔 때는 거래세(국내 약 0.18%)가 붙습니다. 그래서 매수가 그대로가 본전이 아니라, **비용을 넘겨야** 실제 본전입니다.' },
      { type: 'h2', text: '2. 세금은 시장마다 다르다' },
      { type: 'p', text: '해외주식은 연 실현손익 250만원 초과분에 양도소득세 22%가, 배당에는 15.4%가 부과됩니다. 세후로 얼마가 남는지를 기준으로 생각하세요.' },
      { type: 'h2', text: '3. 한 종목에 몰지 않는다' },
      { type: 'p', text: '확신이 강할수록 비중은 커지기 쉽습니다. 하지만 틀렸을 때 계좌 전체가 흔들리지 않도록 **한 종목·한 매매의 비중**을 미리 정해두는 게 오래 살아남는 법입니다.' },
      { type: 'h2', text: '4. 살 이유와 팔 이유를 함께 적는다' },
      { type: 'p', text: '매수할 때 ‘왜 사는지’와 ‘무엇이 틀리면 파는지’를 같이 적어두면, 하락장에서 감정이 아니라 기록으로 판단할 수 있습니다.' },
      { type: 'callout', text: '**요약** — 비용·세금·분산·기록. 화려한 기법보다 이 네 가지가 수익률을 더 오래 지켜줍니다.' },
      { type: 'h2', text: '5. 계산은 감이 아니라 도구로' },
      { type: 'p', text: '손익분기가, 세후 수익, 적정 매수 금액은 머릿속 어림이 아니라 계산기로 확인하세요. 습관이 되면 실수가 줄어듭니다.' },
    ],
  },
  {
    slug: 'compound-and-rule-of-72',
    category: 'asset',
    title: '복리와 72법칙: 시간이 돈이 되는 원리',
    excerpt: '수익률을 72로 나누면 자산이 2배 되는 기간이 보인다. 복리가 왜 눈덩이인지 숫자로 이해하기.',
    readMin: 7,
    date: '2026.07.06',
    relatedTools: [
      { slug: 'compound', label: '복리 계산기' },
      { slug: 'rule72', label: '72법칙 계산기' },
    ],
    body: [
      { type: 'lead', text: '복리는 ‘이자가 이자를 낳는’ 구조입니다. 원금뿐 아니라 지난 수익에도 다시 수익이 붙기 때문에, 시간이 길수록 곡선이 가팔라집니다.' },
      { type: 'h2', text: '단리와 복리의 차이' },
      { type: 'p', text: '단리는 원금에만 이자가 붙지만, 복리는 매년 불어난 잔액 전체에 붙습니다. 초반엔 차이가 작아 보여도 10년, 20년이 지나면 격차가 크게 벌어집니다.' },
      { type: 'h2', text: '72법칙 — 2배 기간을 암산하기' },
      { type: 'p', text: '**72 ÷ 연 수익률**이 대략 자산이 2배 되는 햇수입니다. 연 8%면 약 9년, 6%면 약 12년. 수익률이 조금만 높아져도 2배 도달이 얼마나 빨라지는지 직관적으로 보여줍니다.' },
      { type: 'callout', text: '**핵심** — 복리의 최대 변수는 수익률이 아니라 **시간**입니다. 일찍, 오래가 가장 강력합니다.' },
      { type: 'h2', text: '적립까지 더하면' },
      { type: 'p', text: '초기 투자금에 매달 적립을 더하면 원금 자체가 계속 커지므로 복리 효과가 배가됩니다. 아래 계산기로 기간·수익률을 바꿔보며 곡선을 확인해 보세요.' },
    ],
  },
  {
    slug: 'stop-loss-and-risk-reward',
    category: 'trade',
    title: '손절과 손익비, 계좌를 지키는 법',
    excerpt: '얼마에 자르고 얼마에 챙길지 미리 정하기. 손익비가 왜 이기는 습관인지.',
    readMin: 6,
    date: '2026.07.05',
    relatedTools: [
      { slug: 'stop-target', label: '손절·익절 계산기' },
      { slug: 'position-size', label: '포지션 사이징 계산기' },
    ],
    body: [
      { type: 'lead', text: '수익을 내는 것만큼 중요한 게 잃지 않는 것입니다. 손절과 손익비는 ‘틀렸을 때 얼마나 잃을지’를 먼저 정해 계좌를 지키는 도구입니다.' },
      { type: 'h2', text: '손절 — 틀렸을 때의 출구' },
      { type: 'p', text: '매수할 때 ‘여기까지 내려가면 판다’는 손절가를 함께 정합니다. 감정이 개입하기 전에 규칙으로 정해두는 게 핵심입니다.' },
      { type: 'h2', text: '손익비 — 이기는 판을 고르는 기준' },
      { type: 'p', text: '손익비는 **익절 폭 ÷ 손절 폭**입니다. 5% 손절, 15% 익절이면 손익비는 3. 즉 한 번 이기면 세 번 지는 걸 만회합니다. 손익비가 1보다 크면, 승률이 절반이 안 돼도 장기적으로 살아남을 수 있습니다.' },
      { type: 'callout', text: '**핵심** — 손익비 1 미만(잃을 게 더 큰) 매매를 습관적으로 반복하면, 아무리 승률이 높아도 결국 계좌가 줄어듭니다.' },
      { type: 'h2', text: '얼마를 살지도 리스크로 정한다' },
      { type: 'p', text: '한 매매에서 계좌의 몇 %까지 잃을지(예: 2%)와 손절 폭을 정하면 적정 매수 금액이 나옵니다. 손절·손익비와 매수 금액을 함께 계산해 보세요.' },
    ],
  },
  {
    slug: 'dividend-basics',
    category: 'div',
    title: '배당과 배당수익률, 기초부터',
    excerpt: '배당금·배당수익률·배당락. 세후로 실제 얼마가 들어오는지까지 한 번에.',
    readMin: 5,
    date: '2026.07.02',
    relatedTools: [{ slug: 'dividend', label: '배당금 계산기' }],
    body: [
      { type: 'lead', text: '배당은 기업이 이익의 일부를 주주에게 나눠주는 돈입니다. 주가 상승과 별개로 현금 흐름을 만들어 주는 게 매력입니다.' },
      { type: 'h2', text: '배당수익률이란' },
      { type: 'p', text: '**배당수익률 = 주당 배당금 ÷ 주가 × 100**. 주가가 10만원, 주당 배당금이 3천원이면 배당수익률은 3%입니다. 주가가 내리면 수익률은 올라가고, 오르면 내려갑니다.' },
      { type: 'h2', text: '세후로 생각하기' },
      { type: 'p', text: '배당에는 배당소득세 15.4%(지방세 포함)가 붙습니다. 세전 배당이 100만원이면 실수령은 약 84.6만원. ‘받는 돈’은 세후 기준으로 보는 습관이 필요합니다.' },
      { type: 'h2', text: '배당락 주의' },
      { type: 'p', text: '배당 기준일이 지나면 배당받을 권리가 사라지면서 주가가 배당만큼 조정되는 경향(배당락)이 있습니다. 배당만 노린 단기 매수는 생각보다 이득이 크지 않을 수 있습니다.' },
      { type: 'callout', text: '**요약** — 배당수익률은 주가에 따라 변하고, 실제 수령액은 세후 기준입니다. 계산기로 세전·세후를 함께 확인하세요.' },
    ],
  },
  {
    slug: 'reading-13f',
    category: 'guru',
    title: '워런 버핏의 13F, 이렇게 읽으세요',
    excerpt: '거장들의 분기 포트폴리오 공시(13F)에서 무엇을 보고 무엇을 걸러야 하는지.',
    readMin: 8,
    date: '2026.07.03',
    body: [
      { type: 'lead', text: '13F는 미국의 대형 기관투자자가 분기마다 보유 주식을 공시하는 자료입니다. 버핏 같은 거장이 무엇을 사고팔았는지 엿볼 수 있어 인기가 많습니다.' },
      { type: 'h2', text: '13F로 알 수 있는 것' },
      { type: 'p', text: '분기 말 기준 보유 종목·수량·평가액, 그리고 직전 분기 대비 신규 매수·비중 확대/축소·전량 매도를 볼 수 있습니다. 거장의 관심 방향을 읽는 데 유용합니다.' },
      { type: 'h2', text: '주의할 한계 3가지' },
      { type: 'ul', items: [
        '**시차** — 분기 종료 후 최대 45일 뒤 공시라, 이미 팔았을 수도 있습니다.',
        '**미국 상장 주식 위주** — 공매도·채권·해외주식 등은 대부분 빠집니다.',
        '**맥락 없음** — 왜 샀는지는 나오지 않습니다. 헤지·페어 트레이드의 한쪽일 수도 있습니다.',
      ] },
      { type: 'callout', text: '**핵심** — 13F는 ‘정답 복사’가 아니라 ‘아이디어의 출발점’입니다. 그대로 따라 사기보다, 왜 담았을지 스스로 검증하는 재료로 쓰세요.' },
      { type: 'h2', text: '어떻게 활용할까' },
      { type: 'p', text: '여러 거장이 공통으로 담은 종목, 새로 크게 늘린 종목을 후보로 삼고, 본인의 기준으로 다시 분석하는 흐름이 좋습니다. AntsUp의 거장 포트폴리오에서 분기 변화를 확인해 보세요.' },
    ],
  },
  {
    slug: 'savings-goal',
    category: 'asset',
    title: '적립식 투자, 목표 금액 거꾸로 계산하기',
    excerpt: '‘10년 뒤 1억’을 정하면 매달 얼마를 넣어야 하는지 나온다. 목표에서 시작하는 계획.',
    readMin: 6,
    date: '2026.06.30',
    relatedTools: [
      { slug: 'sip', label: '적립식 목표 계산기' },
      { slug: 'compound', label: '복리 계산기' },
    ],
    body: [
      { type: 'lead', text: '‘얼마를 모을 수 있을까’보다 ‘얼마가 필요하고, 그러려면 매달 얼마를 넣어야 하나’로 질문을 뒤집으면 계획이 구체적이 됩니다.' },
      { type: 'h2', text: '목표에서 거꾸로' },
      { type: 'p', text: '목표 금액·기간·기대 수익률을 정하면 필요한 월 적립금이 계산됩니다. 예를 들어 연 7% 가정, 10년에 1억이라면 매달 얼마가 필요한지 바로 나옵니다.' },
      { type: 'h2', text: '적립식의 힘' },
      { type: 'p', text: '매달 일정액을 꾸준히 넣으면 가격이 쌀 때 더 많이, 비쌀 때 덜 사게 되어 평단이 자연스럽게 관리됩니다. 여기에 복리가 더해지면 후반부 성장이 가팔라집니다.' },
      { type: 'callout', text: '**핵심** — 수익률은 통제할 수 없지만 **적립 습관과 기간**은 통제할 수 있습니다. 계획은 여기서 시작합니다.' },
      { type: 'h2', text: '계산해 보기' },
      { type: 'p', text: '목표 금액과 기간을 넣어 필요한 월 적립금을 확인하고, 복리 계산기로 최종 금액도 함께 점검해 보세요.' },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
