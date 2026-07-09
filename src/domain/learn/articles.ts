// 학습 게시판 콘텐츠 — 표시 전용(글쓰기/댓글/수정은 이후). ko/en/ja 3개국 로컬라이즈.
// 본문은 구조화 블록(MDX 불필요). p 텍스트의 **...** 는 강조로 렌더.

export type Lang = 'ko' | 'en' | 'ja';
export type Loc = Record<Lang, string>;

export const pickL = (loc: Loc, lang: Lang): string => loc[lang] ?? loc.ko;

export type LearnCategory = 'basic' | 'trade' | 'asset' | 'div' | 'guru';

export const LEARN_CATEGORIES: LearnCategory[] = ['basic', 'trade', 'asset', 'div', 'guru'];
export const LEARN_CATEGORY_LABEL: Record<LearnCategory, Loc> = {
  basic: { ko: '기초', en: 'Basics', ja: '基礎' },
  trade: { ko: '매매', en: 'Trading', ja: '売買' },
  asset: { ko: '자산배분', en: 'Allocation', ja: '資産配分' },
  div: { ko: '배당', en: 'Dividends', ja: '配当' },
  guru: { ko: '거장', en: 'Gurus', ja: '巨匠' },
};
export const LEARN_CATEGORY_COLOR: Record<LearnCategory, string> = {
  basic: '#5b8def',
  trade: '#22c55e',
  asset: '#f5a623',
  div: '#fb7185',
  guru: '#a78bfa',
};

/** 헤더 nav 라벨(다국어). */
export const LEARN_NAV = { ko: '학습', en: 'Learn', ja: '学習' };

/** 학습 게시판/상세 UI 크롬 문구(다국어). */
export const LEARN_UI = {
  eyebrow: { ko: 'Learn', en: 'Learn', ja: 'Learn' },
  boardTitle: { ko: '투자, 하나씩 배우기', en: 'Learn investing, one idea at a time', ja: '投資を、ひとつずつ学ぶ' },
  boardSubtitle: {
    ko: '주식이 처음이라도 괜찮아요. 개념 하나, 원칙 하나씩 짧고 쉽게. 읽고 나면 바로 계산기로 연습해 보세요.',
    en: 'New to stocks? No problem. One concept, one principle at a time — short and simple. Then practice right away with the calculators.',
    ja: '株が初めてでも大丈夫。概念ひとつ、原則ひとつを短く易しく。読んだらすぐ計算ツールで練習しましょう。',
  },
  filterAll: { ko: '전체', en: 'All', ja: 'すべて' },
  latest: { ko: '최신 글', en: 'Latest', ja: '最新の記事' },
  editor: { ko: 'AntsUp 에디터', en: 'AntsUp Editor', ja: 'AntsUp 編集部' },
  backToList: { ko: '목록으로', en: 'Back to list', ja: '一覧へ' },
  crumb: { ko: '학습', en: 'Learn', ja: '学習' },
  relatedCalc: { ko: '관련 계산기', en: 'Related calculator', ja: '関連計算ツール' },
  calcCta: { ko: '계산하기 →', en: 'Calculate →', ja: '計算する →' },
  readTogether: { ko: '함께 읽으면 좋아요', en: 'Read next', ja: 'あわせて読みたい' },
  comments: { ko: '댓글', en: 'Comments', ja: 'コメント' },
  comingSoon: { ko: '준비 중', en: 'Coming soon', ja: '準備中' },
  commentsPlaceholder: {
    ko: '댓글 기능은 곧 열립니다. 지금은 읽기 전용이에요.',
    en: 'Comments are coming soon. Read-only for now.',
    ja: 'コメント機能は近日公開予定です。今は閲覧のみです。',
  },
} satisfies Record<string, Loc>;

/** 읽기 시간 표기(로케일별). */
export function readMinLabel(min: number, lang: Lang): string {
  if (lang === 'en') return `${min} min`;
  if (lang === 'ja') return `${min}分`;
  return `${min}분`;
}

// ── 소스 타입(Loc 기반) ──────────────────────────────────
type ArticleBlockL =
  | { type: 'lead'; text: Loc }
  | { type: 'h2'; text: Loc }
  | { type: 'p'; text: Loc }
  | { type: 'callout'; text: Loc }
  | { type: 'ul'; items: Loc[] };

interface RelatedToolL {
  slug: string;
  label: Loc;
}

interface ArticleL {
  slug: string;
  category: LearnCategory;
  title: Loc;
  excerpt: Loc;
  readMin: number;
  date: string;
  featured?: boolean;
  relatedTools?: RelatedToolL[];
  body: ArticleBlockL[];
}

// ── 해석된 타입(문자열 — 컴포넌트가 소비) ────────────────────
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

const ARTICLES_SRC: ArticleL[] = [
  {
    slug: 'averaging-down-up',
    category: 'trade',
    title: {
      ko: '물타기 vs 불타기, 언제 어떻게 해야 할까',
      en: 'Averaging Down vs. Averaging Up: When and How',
      ja: 'ナンピン vs 買い増し、いつどうやるべきか',
    },
    excerpt: {
      ko: '내려서 더 사는 물타기, 올라서 더 사는 불타기. 평단이 어떻게 바뀌는지, 그리고 해도 되는 순간과 하면 안 되는 순간을 가른다.',
      en: 'Buying more as it falls (averaging down) vs. buying more as it rises (averaging up). How your average cost changes — and when each is worth doing or not.',
      ja: '下がって買い増すナンピン、上がって買い増す買い増し。平均取得単価がどう変わるか、そしてやってよい時とダメな時を見分ける。',
    },
    readMin: 6,
    date: '2026.07.08',
    featured: true,
    relatedTools: [
      { slug: 'averaging', label: { ko: '물타기·불타기 평단 계산기', en: 'Average-cost calculator', ja: '平均取得単価 計算ツール' } },
      { slug: 'position-size', label: { ko: '포지션 사이징 계산기', en: 'Position-sizing calculator', ja: 'ポジションサイジング 計算ツール' } },
    ],
    body: [
      {
        type: 'lead',
        text: {
          ko: '주가가 내렸을 때 더 사서 평단을 낮추는 ‘물타기’, 올랐을 때 더 사서 비중을 키우는 ‘불타기’. 둘 다 평균 단가를 바꾸는 행동이지만, 목적과 조건이 완전히 다릅니다.',
          en: '“Averaging down” means buying more after a drop to lower your average cost; “averaging up” means buying more after a rise to build the position. Both change your average price, but their purpose and conditions are completely different.',
          ja: '株価が下がった時に買い増して平均単価を下げる「ナンピン」、上がった時に買い増して比率を増やす「買い増し」。どちらも平均取得単価を変える行動ですが、目的と条件はまったく異なります。',
        },
      },
      { type: 'h2', text: { ko: '물타기 — 평단을 낮추는 추가 매수', en: 'Averaging down — buying more to lower your cost', ja: 'ナンピン — 平均単価を下げる買い増し' } },
      {
        type: 'p',
        text: {
          ko: '보유 종목이 하락했을 때 추가로 매수하면 평균 매수 단가(평단)가 내려갑니다. 10주를 10만원에 샀는데 8만원에 10주를 더 사면 평단은 9만원이 되죠. 본전까지 필요한 상승 폭이 줄어드는 게 장점입니다.',
          en: 'Buying more of a holding after it falls lowers your average cost. If you bought 10 shares at 100 and add 10 more at 80, your average becomes 90. The upside: the rise you need to break even gets smaller.',
          ja: '保有銘柄が下落した時に追加で買うと平均取得単価が下がります。10株を100で買い、80で10株を買い増すと平均は90になります。損益分岐までに必要な上昇幅が小さくなるのが利点です。',
        },
      },
      {
        type: 'p',
        text: {
          ko: '문제는 **‘왜 사는가’**입니다. 단지 싸졌다는 이유로 계속 사면, 하락하는 종목에 계좌가 집중되는 위험이 커집니다.',
          en: 'The catch is **“why are you buying?”** If you keep buying just because it got cheaper, you concentrate your account into a falling stock — and that risk grows fast.',
          ja: '問題は**「なぜ買うのか」**です。単に安くなったという理由で買い続けると、下落する銘柄に口座が集中するリスクが高まります。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**핵심** — 물타기는 ‘싸져서’가 아니라 ‘여전히 좋아서’ 사는 것입니다. 투자 아이디어가 훼손됐다면, 평단을 낮출 게 아니라 계획대로 손절할 때입니다.',
          en: '**Key** — Average down because the thesis is *still good*, not because the price is *lower*. If the investment idea is broken, it’s time to cut the loss as planned, not to lower your cost.',
          ja: '**核心** — ナンピンは「安くなったから」ではなく「今も良いから」買うものです。投資アイデアが崩れたなら、平均単価を下げるのではなく計画通り損切りする時です。',
        },
      },
      { type: 'h2', text: { ko: '불타기 — 오를 때 비중을 키우는 것', en: 'Averaging up — scaling into a winner', ja: '買い増し — 上昇時に比率を増やす' } },
      {
        type: 'p',
        text: {
          ko: '반대로 상승 추세에서 추가 매수하면 평단은 올라가지만, 이기고 있는 포지션의 비중을 키우는 전략입니다. 추세추종 관점에서 자주 쓰이며, 대신 이미 오른 가격에 사므로 손절 라인 관리가 더 중요해집니다.',
          en: 'Adding in an uptrend raises your average cost but grows a winning position. It’s common in trend-following. Because you’re buying at a higher price, managing your stop-loss line matters even more.',
          ja: '逆に上昇トレンドで買い増すと平均単価は上がりますが、勝っているポジションの比率を増やす戦略です。トレンドフォローでよく使われ、既に上がった価格で買うため損切りラインの管理がより重要になります。',
        },
      },
      { type: 'h2', text: { ko: '하기 전에 확인할 3가지', en: 'Three things to check first', ja: '実行前に確認する3つ' } },
      {
        type: 'ul',
        items: [
          {
            ko: '이 종목을 **지금 처음 본다면**, 그래도 살 만한가? (아니라면 물타기 근거도 약하다)',
            en: 'If you were **seeing this stock for the first time today**, would you still buy it? (If not, the case for averaging down is weak too.)',
            ja: 'この銘柄を**今日はじめて見たとして**、それでも買いたいか？（No なら、ナンピンの根拠も弱い）',
          },
          {
            ko: '추가 매수 후 이 종목이 계좌에서 차지하는 **비중**은 얼마인가?',
            en: 'After adding, what **share of your account** will this one stock take up?',
            ja: '買い増し後、この銘柄が口座に占める**比率**はどれくらいか？',
          },
          {
            ko: '틀렸을 때 **어디서 손절**할지 미리 정해뒀는가?',
            en: 'Have you decided in advance **where you’ll cut the loss** if you’re wrong?',
            ja: '間違っていた時に**どこで損切りするか**を事前に決めているか？',
          },
        ],
      },
      { type: 'h2', text: { ko: '숫자로 계산해 보기', en: 'Run the numbers', ja: '数字で計算してみる' } },
      {
        type: 'p',
        text: {
          ko: '추가 매수 후 평단이 정확히 얼마가 되는지, 계좌 대비 적정 매수 금액은 얼마인지는 감이 아니라 계산으로 정하는 편이 안전합니다. 아래 계산기로 바로 확인해 보세요.',
          en: 'Exactly where your average cost lands after adding, and how much to buy relative to your account, are safer decided by calculation than by feel. Check it with the calculators below.',
          ja: '買い増し後の平均単価が正確にいくらになるか、口座に対する適正な買い付け額はいくらかは、感覚ではなく計算で決める方が安全です。下の計算ツールで確認しましょう。',
        },
      },
    ],
  },
  {
    slug: 'before-you-start',
    category: 'basic',
    title: {
      ko: '주식 시작 전, 꼭 아는 5가지',
      en: '5 Things to Know Before You Start Investing',
      ja: '株を始める前に必ず知る5つ',
    },
    excerpt: {
      ko: '계좌·수수료·세금·분산·기록. 첫 매수 전에 5분만 읽으면 실수를 크게 줄일 수 있는 기본기.',
      en: 'Account, fees, taxes, diversification, and journaling. Five minutes before your first buy that can save you from big mistakes.',
      ja: '口座・手数料・税金・分散・記録。初めての買付前に5分読むだけで大きなミスを減らせる基本。',
    },
    readMin: 5,
    date: '2026.07.07',
    relatedTools: [
      { slug: 'trade-cost', label: { ko: '거래비용·손익분기 계산기', en: 'Trading-cost & break-even calculator', ja: '取引コスト・損益分岐 計算ツール' } },
      { slug: 'overseas-tax', label: { ko: '해외주식 양도세 계산기', en: 'Overseas capital-gains tax calculator', ja: '海外株 譲渡税 計算ツール' } },
    ],
    body: [
      {
        type: 'lead',
        text: {
          ko: '투자는 종목을 고르기 전에 ‘구조’를 아는 데서 시작합니다. 첫 매수 전에 알아두면 좋은 다섯 가지를 정리했습니다.',
          en: 'Investing starts with understanding the “structure” before picking a stock. Here are five things worth knowing before your first buy.',
          ja: '投資は銘柄を選ぶ前に「仕組み」を知ることから始まります。初めての買付前に知っておきたい5つをまとめました。',
        },
      },
      { type: 'h2', text: { ko: '1. 거래에는 비용이 든다', en: '1. Trading has costs', ja: '1. 取引にはコストがかかる' } },
      {
        type: 'p',
        text: {
          ko: '살 때·팔 때 증권사 수수료가, 팔 때는 거래세(국내 약 0.18%)가 붙습니다. 그래서 매수가 그대로가 본전이 아니라, **비용을 넘겨야** 실제 본전입니다.',
          en: 'Brokerage fees apply on both buy and sell, and a transaction tax (about 0.18% in Korea) applies when you sell. So your break-even isn’t the purchase price — it’s **the price that also covers your costs.**',
          ja: '買い・売りの両方で証券会社の手数料が、売却時には取引税（韓国で約0.18%）がかかります。だから買値そのものが損益分岐ではなく、**コストを上回って**はじめて実質の損益分岐です。',
        },
      },
      { type: 'h2', text: { ko: '2. 세금은 시장마다 다르다', en: '2. Taxes differ by market', ja: '2. 税金は市場ごとに違う' } },
      {
        type: 'p',
        text: {
          ko: '해외주식은 연 실현손익 250만원 초과분에 양도소득세 22%가, 배당에는 15.4%가 부과됩니다. 세후로 얼마가 남는지를 기준으로 생각하세요.',
          en: 'For overseas stocks (Korea rules), a 22% capital-gains tax applies to annual realized gains above 2.5M KRW, and dividends are taxed at 15.4%. Think in terms of what’s left after tax.',
          ja: '海外株（韓国の制度）は年間の実現損益のうち250万ウォン超の部分に譲渡所得税22%、配当には15.4%が課されます。税引後にいくら残るかを基準に考えましょう。',
        },
      },
      { type: 'h2', text: { ko: '3. 한 종목에 몰지 않는다', en: '3. Don’t pile into one stock', ja: '3. 一銘柄に集中しない' } },
      {
        type: 'p',
        text: {
          ko: '확신이 강할수록 비중은 커지기 쉽습니다. 하지만 틀렸을 때 계좌 전체가 흔들리지 않도록 **한 종목·한 매매의 비중**을 미리 정해두는 게 오래 살아남는 법입니다.',
          en: 'The more conviction you have, the easier it is to oversize a position. But to keep one wrong call from shaking your whole account, deciding **the weight of any single stock or trade** in advance is how you survive long term.',
          ja: '確信が強いほど比率は大きくなりがちです。しかし間違った時に口座全体が揺らがないよう、**一銘柄・一取引の比率**を事前に決めておくことが長く生き残る方法です。',
        },
      },
      { type: 'h2', text: { ko: '4. 살 이유와 팔 이유를 함께 적는다', en: '4. Write down why you buy and why you’d sell', ja: '4. 買う理由と売る理由を一緒に書く' } },
      {
        type: 'p',
        text: {
          ko: '매수할 때 ‘왜 사는지’와 ‘무엇이 틀리면 파는지’를 같이 적어두면, 하락장에서 감정이 아니라 기록으로 판단할 수 있습니다.',
          en: 'If you note both “why I’m buying” and “what would make me sell” at purchase, you can judge by your record — not your emotions — when the market falls.',
          ja: '買う時に「なぜ買うのか」と「何が外れたら売るのか」を一緒に書いておけば、下落相場で感情ではなく記録で判断できます。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**요약** — 비용·세금·분산·기록. 화려한 기법보다 이 네 가지가 수익률을 더 오래 지켜줍니다.',
          en: '**Summary** — Costs, taxes, diversification, journaling. These four protect your returns longer than any flashy technique.',
          ja: '**まとめ** — コスト・税金・分散・記録。派手な手法よりこの4つが、リターンをより長く守ってくれます。',
        },
      },
      { type: 'h2', text: { ko: '5. 계산은 감이 아니라 도구로', en: '5. Calculate with tools, not gut feel', ja: '5. 計算は感覚ではなくツールで' } },
      {
        type: 'p',
        text: {
          ko: '손익분기가, 세후 수익, 적정 매수 금액은 머릿속 어림이 아니라 계산기로 확인하세요. 습관이 되면 실수가 줄어듭니다.',
          en: 'Break-even price, after-tax return, and the right buy amount are better checked with a calculator than estimated in your head. Once it’s a habit, mistakes drop.',
          ja: '損益分岐、税引後リターン、適正な買付額は、頭の中の概算ではなく計算ツールで確認しましょう。習慣になればミスが減ります。',
        },
      },
    ],
  },
  {
    slug: 'compound-and-rule-of-72',
    category: 'asset',
    title: {
      ko: '복리와 72법칙: 시간이 돈이 되는 원리',
      en: 'Compounding and the Rule of 72: How Time Becomes Money',
      ja: '複利と72の法則：時間がお金になる原理',
    },
    excerpt: {
      ko: '수익률을 72로 나누면 자산이 2배 되는 기간이 보인다. 복리가 왜 눈덩이인지 숫자로 이해하기.',
      en: 'Divide 72 by your return and you see how long it takes to double. Understand — in numbers — why compounding snowballs.',
      ja: 'リターンで72を割れば資産が2倍になる期間が見える。複利がなぜ雪だるまなのかを数字で理解する。',
    },
    readMin: 7,
    date: '2026.07.06',
    relatedTools: [
      { slug: 'compound', label: { ko: '복리 계산기', en: 'Compound-interest calculator', ja: '複利 計算ツール' } },
      { slug: 'rule72', label: { ko: '72법칙 계산기', en: 'Rule-of-72 calculator', ja: '72の法則 計算ツール' } },
    ],
    body: [
      {
        type: 'lead',
        text: {
          ko: '복리는 ‘이자가 이자를 낳는’ 구조입니다. 원금뿐 아니라 지난 수익에도 다시 수익이 붙기 때문에, 시간이 길수록 곡선이 가팔라집니다.',
          en: 'Compounding is “interest earning interest.” Because returns accrue not only on your principal but on past gains too, the curve steepens the longer you stay in.',
          ja: '複利は「利子が利子を生む」仕組みです。元本だけでなく過去のリターンにもまたリターンが付くため、時間が長いほど曲線は急になります。',
        },
      },
      { type: 'h2', text: { ko: '단리와 복리의 차이', en: 'Simple vs. compound interest', ja: '単利と複利の違い' } },
      {
        type: 'p',
        text: {
          ko: '단리는 원금에만 이자가 붙지만, 복리는 매년 불어난 잔액 전체에 붙습니다. 초반엔 차이가 작아 보여도 10년, 20년이 지나면 격차가 크게 벌어집니다.',
          en: 'Simple interest accrues only on principal; compound interest accrues on the whole growing balance each year. The gap looks small early on, but over 10 or 20 years it widens dramatically.',
          ja: '単利は元本にのみ利子が付きますが、複利は毎年増えた残高全体に付きます。序盤は差が小さく見えても、10年、20年経つと差は大きく開きます。',
        },
      },
      { type: 'h2', text: { ko: '72법칙 — 2배 기간을 암산하기', en: 'The Rule of 72 — doubling time in your head', ja: '72の法則 — 2倍になる期間を暗算する' } },
      {
        type: 'p',
        text: {
          ko: '**72 ÷ 연 수익률**이 대략 자산이 2배 되는 햇수입니다. 연 8%면 약 9년, 6%면 약 12년. 수익률이 조금만 높아져도 2배 도달이 얼마나 빨라지는지 직관적으로 보여줍니다.',
          en: '**72 ÷ annual return** is roughly the number of years to double. At 8% a year that’s about 9 years; at 6%, about 12. It shows intuitively how much sooner you double when the return rises even a little.',
          ja: '**72 ÷ 年間リターン**が、おおよそ資産が2倍になる年数です。年8%なら約9年、6%なら約12年。リターンが少し上がるだけで2倍到達がどれだけ早まるかを直感的に示します。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**핵심** — 복리의 최대 변수는 수익률이 아니라 **시간**입니다. 일찍, 오래가 가장 강력합니다.',
          en: '**Key** — The biggest lever in compounding isn’t the rate — it’s **time**. Early and long is the most powerful combination.',
          ja: '**核心** — 複利の最大の変数はリターンではなく**時間**です。早く、長くが最も強力です。',
        },
      },
      { type: 'h2', text: { ko: '적립까지 더하면', en: 'Add regular contributions', ja: '積立を加えると' } },
      {
        type: 'p',
        text: {
          ko: '초기 투자금에 매달 적립을 더하면 원금 자체가 계속 커지므로 복리 효과가 배가됩니다. 아래 계산기로 기간·수익률을 바꿔보며 곡선을 확인해 보세요.',
          en: 'Adding monthly contributions to your initial investment keeps the principal itself growing, so compounding multiplies. Try different periods and rates in the calculators below and watch the curve.',
          ja: '初期投資に毎月の積立を加えると元本自体が増え続けるため、複利効果が倍増します。下の計算ツールで期間やリターンを変えて曲線を確認しましょう。',
        },
      },
    ],
  },
  {
    slug: 'stop-loss-and-risk-reward',
    category: 'trade',
    title: {
      ko: '손절과 손익비, 계좌를 지키는 법',
      en: 'Stop-Loss and Risk/Reward: How to Protect Your Account',
      ja: '損切りと損益比、口座を守る方法',
    },
    excerpt: {
      ko: '얼마에 자르고 얼마에 챙길지 미리 정하기. 손익비가 왜 이기는 습관인지.',
      en: 'Decide in advance where you cut and where you take profit. Why a good risk/reward ratio is a winning habit.',
      ja: 'どこで切り、どこで利確するかを事前に決める。損益比がなぜ勝つ習慣なのか。',
    },
    readMin: 6,
    date: '2026.07.05',
    relatedTools: [
      { slug: 'stop-target', label: { ko: '손절·익절 계산기', en: 'Stop-loss / take-profit calculator', ja: '損切り・利確 計算ツール' } },
      { slug: 'position-size', label: { ko: '포지션 사이징 계산기', en: 'Position-sizing calculator', ja: 'ポジションサイジング 計算ツール' } },
    ],
    body: [
      {
        type: 'lead',
        text: {
          ko: '수익을 내는 것만큼 중요한 게 잃지 않는 것입니다. 손절과 손익비는 ‘틀렸을 때 얼마나 잃을지’를 먼저 정해 계좌를 지키는 도구입니다.',
          en: 'Not losing matters as much as winning. Stop-loss and risk/reward are tools that protect your account by deciding first “how much you’ll lose if you’re wrong.”',
          ja: '利益を出すことと同じくらい大切なのが、失わないことです。損切りと損益比は「間違った時にどれだけ失うか」を先に決めて口座を守るツールです。',
        },
      },
      { type: 'h2', text: { ko: '손절 — 틀렸을 때의 출구', en: 'Stop-loss — your exit when wrong', ja: '損切り — 間違った時の出口' } },
      {
        type: 'p',
        text: {
          ko: '매수할 때 ‘여기까지 내려가면 판다’는 손절가를 함께 정합니다. 감정이 개입하기 전에 규칙으로 정해두는 게 핵심입니다.',
          en: 'When you buy, also set a stop price — “if it falls to here, I sell.” The key is to fix it as a rule before emotions get involved.',
          ja: '買う時に「ここまで下がったら売る」という損切り価格も一緒に決めます。感情が入る前にルールとして決めておくのが肝心です。',
        },
      },
      { type: 'h2', text: { ko: '손익비 — 이기는 판을 고르는 기준', en: 'Risk/reward — picking winnable trades', ja: '損益比 — 勝てる勝負を選ぶ基準' } },
      {
        type: 'p',
        text: {
          ko: '손익비는 **익절 폭 ÷ 손절 폭**입니다. 5% 손절, 15% 익절이면 손익비는 3. 즉 한 번 이기면 세 번 지는 걸 만회합니다. 손익비가 1보다 크면, 승률이 절반이 안 돼도 장기적으로 살아남을 수 있습니다.',
          en: 'Risk/reward is **take-profit distance ÷ stop-loss distance.** A 5% stop with a 15% target gives a ratio of 3 — one win offsets three losses. When the ratio is above 1, you can survive long term even with a win rate below 50%.',
          ja: '損益比は**利確幅 ÷ 損切り幅**です。5%損切り・15%利確なら損益比は3。つまり1回の勝ちで3回の負けを取り返せます。損益比が1より大きければ、勝率が5割未満でも長期的に生き残れます。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**핵심** — 손익비 1 미만(잃을 게 더 큰) 매매를 습관적으로 반복하면, 아무리 승률이 높아도 결국 계좌가 줄어듭니다.',
          en: '**Key** — If you habitually take trades with a risk/reward below 1 (more to lose than to gain), your account shrinks over time no matter how high your win rate.',
          ja: '**核心** — 損益比1未満（失う方が大きい）の取引を習慣的に繰り返すと、どれだけ勝率が高くても結局は口座が減っていきます。',
        },
      },
      { type: 'h2', text: { ko: '얼마를 살지도 리스크로 정한다', en: 'Let risk decide how much to buy', ja: 'いくら買うかもリスクで決める' } },
      {
        type: 'p',
        text: {
          ko: '한 매매에서 계좌의 몇 %까지 잃을지(예: 2%)와 손절 폭을 정하면 적정 매수 금액이 나옵니다. 손절·손익비와 매수 금액을 함께 계산해 보세요.',
          en: 'Decide how much of your account you’ll risk on one trade (say 2%) and your stop distance, and the right buy amount follows. Calculate your stop, risk/reward, and buy size together.',
          ja: '1回の取引で口座の何%まで失うか（例：2%）と損切り幅を決めれば、適正な買付額が出ます。損切り・損益比と買付額を一緒に計算してみましょう。',
        },
      },
    ],
  },
  {
    slug: 'dividend-basics',
    category: 'div',
    title: {
      ko: '배당과 배당수익률, 기초부터',
      en: 'Dividends and Dividend Yield, From the Ground Up',
      ja: '配当と配当利回り、基礎から',
    },
    excerpt: {
      ko: '배당금·배당수익률·배당락. 세후로 실제 얼마가 들어오는지까지 한 번에.',
      en: 'Dividend, dividend yield, and the ex-dividend drop — including what actually lands in your account after tax.',
      ja: '配当金・配当利回り・配当落ち。税引後に実際いくら入るかまで一度に。',
    },
    readMin: 5,
    date: '2026.07.02',
    relatedTools: [{ slug: 'dividend', label: { ko: '배당금 계산기', en: 'Dividend calculator', ja: '配当金 計算ツール' } }],
    body: [
      {
        type: 'lead',
        text: {
          ko: '배당은 기업이 이익의 일부를 주주에게 나눠주는 돈입니다. 주가 상승과 별개로 현금 흐름을 만들어 주는 게 매력입니다.',
          en: 'A dividend is cash a company pays shareholders out of its profits. Its appeal is creating cash flow independent of price appreciation.',
          ja: '配当は企業が利益の一部を株主に分配するお金です。株価上昇とは別にキャッシュフローを生む点が魅力です。',
        },
      },
      { type: 'h2', text: { ko: '배당수익률이란', en: 'What dividend yield means', ja: '配当利回りとは' } },
      {
        type: 'p',
        text: {
          ko: '**배당수익률 = 주당 배당금 ÷ 주가 × 100**. 주가가 10만원, 주당 배당금이 3천원이면 배당수익률은 3%입니다. 주가가 내리면 수익률은 올라가고, 오르면 내려갑니다.',
          en: '**Dividend yield = dividend per share ÷ price × 100.** At a price of 100,000 with a 3,000 dividend per share, the yield is 3%. When the price falls, yield rises; when it rises, yield falls.',
          ja: '**配当利回り = 1株当たり配当 ÷ 株価 × 100**。株価が10万、1株配当が3千なら配当利回りは3%です。株価が下がると利回りは上がり、上がると下がります。',
        },
      },
      { type: 'h2', text: { ko: '세후로 생각하기', en: 'Think after tax', ja: '税引後で考える' } },
      {
        type: 'p',
        text: {
          ko: '배당에는 배당소득세 15.4%(지방세 포함)가 붙습니다. 세전 배당이 100만원이면 실수령은 약 84.6만원. ‘받는 돈’은 세후 기준으로 보는 습관이 필요합니다.',
          en: 'Dividends are taxed at 15.4% (local tax included, Korea). A pre-tax dividend of 1,000,000 nets about 846,000. Get in the habit of reading “what you receive” on an after-tax basis.',
          ja: '配当には配当所得税15.4%（地方税込み、韓国）がかかります。税引前配当が100万なら手取りは約84.6万。「受け取る額」は税引後で見る習慣が必要です。',
        },
      },
      { type: 'h2', text: { ko: '배당락 주의', en: 'Mind the ex-dividend drop', ja: '配当落ちに注意' } },
      {
        type: 'p',
        text: {
          ko: '배당 기준일이 지나면 배당받을 권리가 사라지면서 주가가 배당만큼 조정되는 경향(배당락)이 있습니다. 배당만 노린 단기 매수는 생각보다 이득이 크지 않을 수 있습니다.',
          en: 'After the record date, the right to the dividend disappears and the price tends to adjust down by roughly the dividend amount (the ex-dividend drop). Buying short-term just to grab a dividend may pay off less than you expect.',
          ja: '権利確定日を過ぎると配当を受け取る権利が消え、株価が配当分だけ調整される傾向（配当落ち）があります。配当だけを狙った短期の買いは、思ったほど得にならないことがあります。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**요약** — 배당수익률은 주가에 따라 변하고, 실제 수령액은 세후 기준입니다. 계산기로 세전·세후를 함께 확인하세요.',
          en: '**Summary** — Dividend yield moves with the price, and what you actually receive is after tax. Check pre- and post-tax together in the calculator.',
          ja: '**まとめ** — 配当利回りは株価によって変わり、実際の受取額は税引後です。計算ツールで税引前・税引後を一緒に確認しましょう。',
        },
      },
    ],
  },
  {
    slug: 'reading-13f',
    category: 'guru',
    title: {
      ko: '워런 버핏의 13F, 이렇게 읽으세요',
      en: 'How to Read Warren Buffett’s 13F',
      ja: 'ウォーレン・バフェットの13F、こう読む',
    },
    excerpt: {
      ko: '거장들의 분기 포트폴리오 공시(13F)에서 무엇을 보고 무엇을 걸러야 하는지.',
      en: 'What to look for — and what to filter out — in the quarterly 13F portfolio filings of great investors.',
      ja: '巨匠の四半期ポートフォリオ開示（13F）で、何を見て何を除くべきか。',
    },
    readMin: 8,
    date: '2026.07.03',
    body: [
      {
        type: 'lead',
        text: {
          ko: '13F는 미국의 대형 기관투자자가 분기마다 보유 주식을 공시하는 자료입니다. 버핏 같은 거장이 무엇을 사고팔았는지 엿볼 수 있어 인기가 많습니다.',
          en: 'A 13F is a quarterly filing in which large U.S. institutional investors disclose their stock holdings. It’s popular because you can glimpse what greats like Buffett bought and sold.',
          ja: '13Fは米国の大手機関投資家が四半期ごとに保有株を開示する資料です。バフェットのような巨匠が何を売買したかを垣間見られるため人気があります。',
        },
      },
      { type: 'h2', text: { ko: '13F로 알 수 있는 것', en: 'What a 13F tells you', ja: '13Fで分かること' } },
      {
        type: 'p',
        text: {
          ko: '분기 말 기준 보유 종목·수량·평가액, 그리고 직전 분기 대비 신규 매수·비중 확대/축소·전량 매도를 볼 수 있습니다. 거장의 관심 방향을 읽는 데 유용합니다.',
          en: 'Holdings, share counts, and market values as of quarter-end, plus new buys, increases/decreases, and full exits versus the prior quarter. Useful for reading where a great investor’s attention is heading.',
          ja: '四半期末時点の保有銘柄・株数・評価額、そして前四半期比の新規買い・比率の拡大/縮小・全売却が分かります。巨匠の関心の向きを読むのに役立ちます。',
        },
      },
      { type: 'h2', text: { ko: '주의할 한계 3가지', en: 'Three limits to watch', ja: '注意すべき限界3つ' } },
      {
        type: 'ul',
        items: [
          {
            ko: '**시차** — 분기 종료 후 최대 45일 뒤 공시라, 이미 팔았을 수도 있습니다.',
            en: '**Lag** — Filed up to 45 days after quarter-end, so they may have already sold.',
            ja: '**タイムラグ** — 四半期終了後最大45日後の開示なので、すでに売却済みの可能性があります。',
          },
          {
            ko: '**미국 상장 주식 위주** — 공매도·채권·해외주식 등은 대부분 빠집니다.',
            en: '**U.S.-listed stocks mostly** — short positions, bonds, and foreign stocks are largely excluded.',
            ja: '**米国上場株が中心** — 空売り・債券・外国株などはほとんど含まれません。',
          },
          {
            ko: '**맥락 없음** — 왜 샀는지는 나오지 않습니다. 헤지·페어 트레이드의 한쪽일 수도 있습니다.',
            en: '**No context** — it doesn’t say why they bought. It could be one leg of a hedge or a pair trade.',
            ja: '**文脈なし** — なぜ買ったかは出てきません。ヘッジやペアトレードの片側かもしれません。',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          ko: '**핵심** — 13F는 ‘정답 복사’가 아니라 ‘아이디어의 출발점’입니다. 그대로 따라 사기보다, 왜 담았을지 스스로 검증하는 재료로 쓰세요.',
          en: '**Key** — A 13F is a “starting point for ideas,” not an “answer key to copy.” Rather than buying blindly, use it as material to verify for yourself why they might have bought.',
          ja: '**核心** — 13Fは「正解のコピー」ではなく「アイデアの出発点」です。そのまま真似て買うより、なぜ組み入れたのかを自分で検証する材料に使いましょう。',
        },
      },
      { type: 'h2', text: { ko: '어떻게 활용할까', en: 'How to use it', ja: 'どう活用するか' } },
      {
        type: 'p',
        text: {
          ko: '여러 거장이 공통으로 담은 종목, 새로 크게 늘린 종목을 후보로 삼고, 본인의 기준으로 다시 분석하는 흐름이 좋습니다. AntsUp의 거장 포트폴리오에서 분기 변화를 확인해 보세요.',
          en: 'Take stocks that several greats hold in common, or ones newly increased in size, as candidates — then re-analyze them by your own criteria. Check the quarterly changes in AntsUp’s Guru Portfolios.',
          ja: '複数の巨匠が共通で保有する銘柄や、新たに大きく増やした銘柄を候補とし、自分の基準で再分析する流れが良いです。AntsUpの巨匠ポートフォリオで四半期の変化を確認しましょう。',
        },
      },
    ],
  },
  {
    slug: 'savings-goal',
    category: 'asset',
    title: {
      ko: '적립식 투자, 목표 금액 거꾸로 계산하기',
      en: 'Recurring Investing: Work Backward From Your Goal',
      ja: '積立投資、目標額から逆算する',
    },
    excerpt: {
      ko: '‘10년 뒤 1억’을 정하면 매달 얼마를 넣어야 하는지 나온다. 목표에서 시작하는 계획.',
      en: 'Set “100M in 10 years” and it tells you how much to put in each month. Planning that starts from the goal.',
      ja: '「10年後に1億」と決めれば、毎月いくら入れるべきかが出る。目標から始める計画。',
    },
    readMin: 6,
    date: '2026.06.30',
    relatedTools: [
      { slug: 'sip', label: { ko: '적립식 목표 계산기', en: 'Recurring-investment goal calculator', ja: '積立目標 計算ツール' } },
      { slug: 'compound', label: { ko: '복리 계산기', en: 'Compound-interest calculator', ja: '複利 計算ツール' } },
    ],
    body: [
      {
        type: 'lead',
        text: {
          ko: '‘얼마를 모을 수 있을까’보다 ‘얼마가 필요하고, 그러려면 매달 얼마를 넣어야 하나’로 질문을 뒤집으면 계획이 구체적이 됩니다.',
          en: 'Flip the question from “how much can I save?” to “how much do I need, and how much must I contribute monthly to get there?” — and the plan gets concrete.',
          ja: '「いくら貯められるか」より「いくら必要で、そのために毎月いくら入れるべきか」に問いを反転させると、計画が具体的になります。',
        },
      },
      { type: 'h2', text: { ko: '목표에서 거꾸로', en: 'Backward from the goal', ja: '目標から逆算' } },
      {
        type: 'p',
        text: {
          ko: '목표 금액·기간·기대 수익률을 정하면 필요한 월 적립금이 계산됩니다. 예를 들어 연 7% 가정, 10년에 1억이라면 매달 얼마가 필요한지 바로 나옵니다.',
          en: 'Set a target amount, a period, and an expected return, and the required monthly contribution follows. Assume 7% a year toward 100M in 10 years, and it tells you the monthly amount right away.',
          ja: '目標額・期間・期待リターンを決めれば、必要な毎月の積立額が計算されます。例えば年7%想定で10年後に1億なら、毎月いくら必要かがすぐ出ます。',
        },
      },
      { type: 'h2', text: { ko: '적립식의 힘', en: 'The power of recurring investing', ja: '積立の力' } },
      {
        type: 'p',
        text: {
          ko: '매달 일정액을 꾸준히 넣으면 가격이 쌀 때 더 많이, 비쌀 때 덜 사게 되어 평단이 자연스럽게 관리됩니다. 여기에 복리가 더해지면 후반부 성장이 가팔라집니다.',
          en: 'Contributing a fixed amount every month buys more when prices are low and less when high, so your average cost is managed naturally. Add compounding and the later-stage growth steepens.',
          ja: '毎月一定額を継続して入れると、安い時に多く・高い時に少なく買うことになり、平均取得単価が自然に管理されます。ここに複利が加わると後半の成長が急になります。',
        },
      },
      {
        type: 'callout',
        text: {
          ko: '**핵심** — 수익률은 통제할 수 없지만 **적립 습관과 기간**은 통제할 수 있습니다. 계획은 여기서 시작합니다.',
          en: '**Key** — You can’t control the return, but you *can* control **your contribution habit and time horizon.** That’s where the plan begins.',
          ja: '**核心** — リターンは制御できませんが、**積立の習慣と期間**は制御できます。計画はここから始まります。',
        },
      },
      { type: 'h2', text: { ko: '계산해 보기', en: 'Run the numbers', ja: '計算してみる' } },
      {
        type: 'p',
        text: {
          ko: '목표 금액과 기간을 넣어 필요한 월 적립금을 확인하고, 복리 계산기로 최종 금액도 함께 점검해 보세요.',
          en: 'Enter your target and period to find the required monthly contribution, then check the final amount with the compound-interest calculator too.',
          ja: '目標額と期間を入れて必要な毎月の積立額を確認し、複利計算ツールで最終額も合わせて点検しましょう。',
        },
      },
    ],
  },
];

// ── 로컬라이즈 헬퍼 ─────────────────────────────────────────
function localizeBlocks(blocks: ArticleBlockL[], lang: Lang): ArticleBlock[] {
  return blocks.map((b) => {
    if (b.type === 'ul') {
      return { type: 'ul', items: b.items.map((it) => pickL(it, lang)) };
    }
    return { type: b.type, text: pickL(b.text, lang) };
  });
}

function localizeArticle(a: ArticleL, lang: Lang): Article {
  return {
    slug: a.slug,
    category: a.category,
    title: pickL(a.title, lang),
    excerpt: pickL(a.excerpt, lang),
    readMin: a.readMin,
    date: a.date,
    featured: a.featured,
    relatedTools: a.relatedTools?.map((t) => ({ slug: t.slug, label: pickL(t.label, lang) })),
    body: localizeBlocks(a.body, lang),
  };
}

/** slug 목록/정적 파라미터용(언어 무관). */
export const ARTICLE_SLUGS: string[] = ARTICLES_SRC.map((a) => a.slug);

/** 언어별 전체 목록 — 게시판/목록 렌더용. */
export function getArticles(lang: Lang): Article[] {
  return ARTICLES_SRC.map((a) => localizeArticle(a, lang));
}

/** 언어별 단건 조회 — 상세 렌더용. */
export function getArticle(slug: string, lang: Lang): Article | undefined {
  const a = ARTICLES_SRC.find((x) => x.slug === slug);
  return a ? localizeArticle(a, lang) : undefined;
}

/** 메타데이터용 로케일 원본(title/excerpt Loc) 조회. */
export function getArticleSeo(slug: string): { title: Loc; excerpt: Loc; date: string; category: LearnCategory } | undefined {
  const a = ARTICLES_SRC.find((x) => x.slug === slug);
  return a ? { title: a.title, excerpt: a.excerpt, date: a.date, category: a.category } : undefined;
}
