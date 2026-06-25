import type { Language } from '../domain/i18n/types';

// 투자 성향 진단 데이터 — 콘텐츠는 investorQuotes.ts 와 동일하게 ko/en/ja 인라인.
// (UI 크롬만 i18n TranslationSchema 의 persona 블록 사용)

export type PersonaKey = 'value' | 'growth' | 'macro' | 'contrarian';

interface L {
  ko: string;
  en: string;
  ja: string;
}

export interface QuizOption {
  persona: PersonaKey;
  label: L;
}

export interface QuizQuestion {
  question: L;
  options: QuizOption[];
}

export interface Persona {
  key: PersonaKey;
  name: L;
  tagline: L;
  desc: L;
  gurus: L[];
}

export function pickL(l: L, lang: Language): string {
  return lang === 'ko' ? l.ko : lang === 'ja' ? l.ja : l.en;
}

export const PERSONA_QUESTIONS: QuizQuestion[] = [
  {
    question: {
      ko: '투자할 때 가장 끌리는 방식은?',
      en: 'Which approach appeals to you most?',
      ja: '投資で最も惹かれるスタイルは？',
    },
    options: [
      {
        persona: 'value',
        label: {
          ko: '좋은 기업을 싸게 사서 오래 보유',
          en: 'Buy great companies cheap and hold long',
          ja: '良い企業を安く買って長期保有',
        },
      },
      {
        persona: 'growth',
        label: {
          ko: '성장하는 기업의 미래에 베팅',
          en: 'Bet on the future of growing companies',
          ja: '成長企業の未来に賭ける',
        },
      },
      {
        persona: 'macro',
        label: {
          ko: '시장 전체 흐름과 자산 배분 중시',
          en: 'Focus on market trends and asset allocation',
          ja: '市場全体の流れと資産配分を重視',
        },
      },
      {
        persona: 'contrarian',
        label: {
          ko: '남들이 외면할 때 기회를 찾기',
          en: 'Find opportunity when others look away',
          ja: '皆が避けるときに機会を探す',
        },
      },
    ],
  },
  {
    question: {
      ko: '보유 종목이 크게 하락하면?',
      en: 'When a holding drops sharply?',
      ja: '保有銘柄が大きく下落したら？',
    },
    options: [
      {
        persona: 'value',
        label: {
          ko: '싸진 우량주를 더 산다',
          en: 'Buy more of the now-cheaper quality stock',
          ja: '安くなった優良株を買い増す',
        },
      },
      {
        persona: 'growth',
        label: {
          ko: '성장 스토리가 유효하면 버틴다',
          en: 'Hold if the growth thesis still holds',
          ja: '成長ストーリーが有効なら持ち続ける',
        },
      },
      {
        persona: 'macro',
        label: {
          ko: '분산·헤지로 리스크를 관리한다',
          en: 'Manage risk via diversification and hedging',
          ja: '分散・ヘッジでリスクを管理',
        },
      },
      {
        persona: 'contrarian',
        label: {
          ko: '공포가 클수록 역발상으로 본다',
          en: 'The more fear, the more contrarian I get',
          ja: '恐怖が大きいほど逆張りで見る',
        },
      },
    ],
  },
  {
    question: {
      ko: '가장 관심 가는 종목은?',
      en: 'Which stocks interest you most?',
      ja: '最も関心のある銘柄は？',
    },
    options: [
      {
        persona: 'value',
        label: {
          ko: '저평가된 안정적 우량주',
          en: 'Undervalued, stable blue chips',
          ja: '割安で安定した優良株',
        },
      },
      {
        persona: 'growth',
        label: {
          ko: '고성장 혁신·기술주',
          en: 'High-growth innovative and tech stocks',
          ja: '高成長の革新・テック株',
        },
      },
      {
        persona: 'macro',
        label: {
          ko: '지수·원자재·채권 등 자산 배분',
          en: 'Indices, commodities, bonds — allocation',
          ja: '指数・商品・債券など資産配分',
        },
      },
      {
        persona: 'contrarian',
        label: {
          ko: '소외주·위기 기업·턴어라운드',
          en: 'Out-of-favor, distressed, turnarounds',
          ja: '不人気株・危機企業・ターンアラウンド',
        },
      },
    ],
  },
  {
    question: {
      ko: '투자 판단의 핵심 근거는?',
      en: 'What drives your decisions?',
      ja: '投資判断の主な根拠は？',
    },
    options: [
      {
        persona: 'value',
        label: {
          ko: '재무제표와 내재가치',
          en: 'Financials and intrinsic value',
          ja: '財務諸表と本質的価値',
        },
      },
      {
        persona: 'growth',
        label: {
          ko: '산업 트렌드와 성장 잠재력',
          en: 'Industry trends and growth potential',
          ja: '業界トレンドと成長性',
        },
      },
      {
        persona: 'macro',
        label: {
          ko: '금리·경기 등 거시 지표',
          en: 'Rates, cycles, and macro data',
          ja: '金利・景気などマクロ指標',
        },
      },
      {
        persona: 'contrarian',
        label: {
          ko: '시장 심리와 촉매(catalyst)',
          en: 'Market psychology and catalysts',
          ja: '市場心理と触媒(カタリスト)',
        },
      },
    ],
  },
];

export const PERSONAS: Record<PersonaKey, Persona> = {
  value: {
    key: 'value',
    name: { ko: '가치 투자형', en: 'The Value Investor', ja: 'バリュー投資型' },
    tagline: { ko: '안전마진과 인내', en: 'Margin of safety & patience', ja: '安全域と忍耐' },
    desc: {
      ko: '저평가된 우량 기업을 발굴해 오래 보유합니다. 가격보다 가치, 유행보다 원칙을 따릅니다.',
      en: 'You find undervalued quality companies and hold for the long run — value over price, principles over fads.',
      ja: '割安な優良企業を見つけ長期保有。価格より価値、流行より原則を重視します。',
    },
    gurus: [
      { ko: '워런 버핏', en: 'Warren Buffett', ja: 'ウォーレン・バフェット' },
      { ko: '찰리 멍거', en: 'Charlie Munger', ja: 'チャーリー・マンガー' },
      { ko: '세스 클라먼', en: 'Seth Klarman', ja: 'セス・クラーマン' },
    ],
  },
  growth: {
    key: 'growth',
    name: { ko: '성장 투자형', en: 'The Growth Investor', ja: 'グロース投資型' },
    tagline: { ko: '혁신과 미래', en: 'Innovation & the future', ja: '革新と未来' },
    desc: {
      ko: '혁신 기업의 성장 잠재력에 베팅합니다. 단기 변동보다 장기 성장 스토리를 봅니다.',
      en: 'You bet on the growth potential of innovative companies, looking past short-term swings to the long-term story.',
      ja: '革新企業の成長性に賭け、短期の変動より長期の成長ストーリーを見ます。',
    },
    gurus: [
      { ko: '캐시 우드', en: 'Cathie Wood', ja: 'キャシー・ウッド' },
      { ko: '빌 애크먼', en: 'Bill Ackman', ja: 'ビル・アックマン' },
    ],
  },
  macro: {
    key: 'macro',
    name: { ko: '매크로·분산형', en: 'The Macro Allocator', ja: 'マクロ・分散型' },
    tagline: { ko: '거시 흐름과 리스크 분산', en: 'Macro trends & diversification', ja: 'マクロの流れと分散' },
    desc: {
      ko: '거시 경제 흐름을 읽고 자산을 분산해 리스크를 관리합니다. 한 종목보다 포트폴리오 전체를 봅니다.',
      en: 'You read macro trends and diversify to manage risk — focusing on the whole portfolio over any single name.',
      ja: 'マクロの流れを読み、分散でリスクを管理。単一銘柄よりポートフォリオ全体を見ます。',
    },
    gurus: [
      { ko: '레이 달리오', en: 'Ray Dalio', ja: 'レイ・ダリオ' },
      { ko: '조지 소로스', en: 'George Soros', ja: 'ジョージ・ソロス' },
      { ko: '짐 사이먼스', en: 'Jim Simons', ja: 'ジム・シモンズ' },
    ],
  },
  contrarian: {
    key: 'contrarian',
    name: { ko: '역발상·행동형', en: 'The Contrarian', ja: '逆張り・アクティビスト型' },
    tagline: { ko: '위기 속 기회', en: 'Opportunity in crisis', ja: '危機の中の機会' },
    desc: {
      ko: '시장이 공포에 빠질 때 기회를 찾고 촉매를 노립니다. 남들과 반대로 생각하는 데서 수익을 봅니다.',
      en: 'You find opportunity when the market panics and hunt for catalysts — profiting by thinking against the crowd.',
      ja: '市場が恐怖に陥るとき機会を探し、触媒を狙う。群衆と反対に考えることで利益を得ます。',
    },
    gurus: [
      { ko: '마이클 버리', en: 'Michael Burry', ja: 'マイケル・バーリ' },
      { ko: '칼 아이칸', en: 'Carl Icahn', ja: 'カール・アイカーン' },
    ],
  },
};

/** 답안(성향 배열) → 최다 득표 성향. 동점 시 정의 순서(value→growth→macro→contrarian) 우선. */
export function scorePersona(answers: PersonaKey[]): PersonaKey {
  const counts: Record<PersonaKey, number> = { value: 0, growth: 0, macro: 0, contrarian: 0 };
  for (const a of answers) counts[a] += 1;
  const order: PersonaKey[] = ['value', 'growth', 'macro', 'contrarian'];
  return order.reduce((best, k) => (counts[k] > counts[best] ? k : best), order[0]);
}
