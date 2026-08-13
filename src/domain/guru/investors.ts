// 거장 프로필 메타 — 백엔드가 주는 것은 이름·CIK·수치뿐이라, 투자 스타일 분류와 한 줄 소개는
// 프론트 정적 메타로 보완한다. 키는 백엔드 FAMOUS_INVESTORS 키(TIER1)와 동일.
// 미등록 키가 와도 화면이 깨지지 않도록 조회 헬퍼는 항상 폴백을 반환한다.

import type { Language } from '../i18n/types';

export type GuruStyle = 'value' | 'activist' | 'growth' | 'macro' | 'contrarian';

export const GURU_STYLE_ORDER: GuruStyle[] = [
  'value',
  'activist',
  'growth',
  'macro',
  'contrarian',
];

export const GURU_STYLE_LABEL: Record<GuruStyle, Record<Language, string>> = {
  value: { ko: '가치 투자', en: 'Value', ja: 'バリュー投資' },
  activist: { ko: '행동주의', en: 'Activist', ja: 'アクティビスト' },
  growth: { ko: '테크 · 성장', en: 'Tech & Growth', ja: 'テック・グロース' },
  macro: { ko: '매크로 · 퀀트', en: 'Macro & Quant', ja: 'マクロ・クオンツ' },
  contrarian: { ko: '역발상 · 집중', en: 'Contrarian', ja: '逆張り・集中' },
};

export const GURU_STYLE_DESC: Record<GuruStyle, Record<Language, string>> = {
  value: {
    ko: '싼 가격에 사서 오래 들고 가는 쪽 — 버핏·그레이엄 계보',
    en: 'Buy below intrinsic value and hold — the Buffett/Graham lineage',
    ja: '割安で買って長く持つ — バフェット・グレアム系譜',
  },
  activist: {
    ko: '지분을 쥐고 경영에 직접 목소리를 내는 쪽',
    en: 'Take a stake, then push management to change',
    ja: '株式を取得し経営に直接関与する',
  },
  growth: {
    ko: '기술 변화의 초기 국면에 베팅하는 쪽',
    en: 'Bet early on technology shifts',
    ja: '技術変化の初期段階に賭ける',
  },
  macro: {
    ko: '거시 흐름과 통계 모델로 판단하는 쪽',
    en: 'Trade the macro cycle or systematic models',
    ja: 'マクロの流れと統計モデルで判断する',
  },
  contrarian: {
    ko: '남들과 반대로, 소수 종목에 확신을 싣는 쪽',
    en: 'Go against consensus with concentrated conviction',
    ja: '市場と反対に、少数銘柄へ確信を置く',
  },
};

interface GuruProfile {
  style: GuruStyle;
  /** 인물명 현지 표기 — 백엔드는 영문만 주므로 검색 유입(예: "워런 버핏")을 위해 별도 보유. */
  person: Record<Language, string>;
  /** 카드·상세 헤더의 한 줄 소개 (수치·전망 없이 인물 성격만). */
  bio: Record<Language, string>;
}

export const GURU_PROFILES: Record<string, GuruProfile> = {
  buffett: {
    style: 'value',
    person: { ko: '워런 버핏', en: 'Warren Buffett', ja: 'ウォーレン・バフェット' },
    bio: {
      ko: '오마하의 현인 — 좋은 기업을 적정가에 사서 아주 오래 보유',
      en: 'The Oracle of Omaha — great businesses at fair prices, held forever',
      ja: 'オマハの賢人 — 良い企業を適正価格で長期保有',
    },
  },
  klarman: {
    style: 'value',
    person: { ko: '세스 클라먼', en: 'Seth Klarman', ja: 'セス・クラーマン' },
    bio: {
      ko: '『안전마진』의 저자 — 현금 보유를 두려워하지 않는 보수적 가치투자',
      en: 'Author of Margin of Safety — unafraid to sit in cash',
      ja: '『安全余裕率』の著者 — 現金保有を恐れない保守的バリュー',
    },
  },
  marks: {
    style: 'value',
    person: { ko: '하워드 막스', en: 'Howard Marks', ja: 'ハワード・マークス' },
    bio: {
      ko: '메모로 유명한 부실채권 투자자 — 사이클의 위치를 먼저 묻는다',
      en: 'Distressed-debt investor famed for his memos on market cycles',
      ja: 'メモで有名なディストレスト投資家 — サイクルの位置を問う',
    },
  },
  gayner: {
    style: 'value',
    person: { ko: '토마스 게이너', en: 'Thomas Gayner', ja: 'トーマス・ゲイナー' },
    bio: {
      ko: '보험사 자본으로 운용하는 "작은 버크셔" 스타일',
      en: 'Runs insurance float in a “mini-Berkshire” style',
      ja: '保険会社の資本で運用する「小さなバークシャー」',
    },
  },
  liLu: {
    style: 'value',
    person: { ko: '리 루', en: 'Li Lu', ja: 'リー・ルー' },
    bio: {
      ko: '멍거가 자기 돈을 맡긴 투자자 — 소수 종목 장기 보유',
      en: 'The investor Munger trusted with his own money',
      ja: 'マンガーが自身の資金を託した投資家',
    },
  },
  pabrai: {
    style: 'value',
    person: { ko: '모니시 파브라이', en: 'Mohnish Pabrai', ja: 'モニッシュ・パブライ' },
    bio: {
      ko: '"복제 투자"를 공언하는 집중 가치투자자',
      en: 'Openly clones great investors, concentrated by design',
      ja: '「複製投資」を公言する集中バリュー投資家',
    },
  },
  ackman: {
    style: 'activist',
    person: { ko: '빌 애크먼', en: 'Bill Ackman', ja: 'ビル・アックマン' },
    bio: {
      ko: '소수 종목에 크게 걸고 공개적으로 싸우는 행동주의',
      en: 'Concentrated activist who fights his battles in public',
      ja: '少数銘柄に大きく賭け公然と戦うアクティビスト',
    },
  },
  icahn: {
    style: 'activist',
    person: { ko: '칼 아이칸', en: 'Carl Icahn', ja: 'カール・アイカーン' },
    bio: {
      ko: '기업 사냥꾼의 원형 — 이사회를 흔들어 가치를 끌어낸다',
      en: 'The original corporate raider — shakes up boards for value',
      ja: '企業買収者の原型 — 取締役会を揺さぶり価値を引き出す',
    },
  },
  peltz: {
    style: 'activist',
    person: { ko: '넬슨 펠츠', en: 'Nelson Peltz', ja: 'ネルソン・ペルツ' },
    bio: {
      ko: '소비재 대기업의 체질 개선을 요구해온 행동주의',
      en: 'Activist pressing consumer giants to restructure',
      ja: '消費財大手の体質改善を求めるアクティビスト',
    },
  },
  hohn: {
    style: 'activist',
    person: { ko: '크리스 혼', en: 'Chris Hohn', ja: 'クリス・ホーン' },
    bio: {
      ko: '인프라·독점 기업을 선호하는 영국계 행동주의',
      en: 'UK activist drawn to infrastructure and monopolies',
      ja: 'インフラ・独占企業を好む英国系アクティビスト',
    },
  },
  loeb: {
    style: 'activist',
    person: { ko: '댄 로브', en: 'Dan Loeb', ja: 'ダニエル・ローブ' },
    bio: {
      ko: '날 선 주주 서한으로 알려진 이벤트 드리븐 투자자',
      en: 'Event-driven investor known for sharp shareholder letters',
      ja: '鋭い株主書簡で知られるイベントドリブン投資家',
    },
  },
  coleman: {
    style: 'growth',
    person: { ko: '체이스 콜먼', en: 'Chase Coleman', ja: 'チェイス・コールマン' },
    bio: {
      ko: '타이거 컵 대표 주자 — 상장·비상장 테크 성장주',
      en: 'Leading “Tiger cub” — public and private tech growth',
      ja: 'タイガー・カブ筆頭 — 上場・未上場テック成長株',
    },
  },
  wood: {
    style: 'growth',
    person: { ko: '캐시 우드', en: 'Cathie Wood', ja: 'キャシー・ウッド' },
    bio: {
      ko: '파괴적 혁신에 집중 — 매매 내역을 매일 공개하는 운용사',
      en: 'Disruptive-innovation focus; publishes trades daily',
      ja: '破壊的イノベーションに集中 — 売買を毎日公開',
    },
  },
  dalio: {
    style: 'macro',
    person: { ko: '레이 달리오', en: 'Ray Dalio', ja: 'レイ・ダリオ' },
    bio: {
      ko: '경제를 기계처럼 모델링하는 글로벌 매크로의 대표',
      en: 'Models the economy as a machine — global macro flagship',
      ja: '経済を機械のようにモデル化するグローバルマクロの代表',
    },
  },
  soros: {
    style: 'macro',
    person: { ko: '조지 소로스', en: 'George Soros', ja: 'ジョージ・ソロス' },
    bio: {
      ko: '재귀성 이론 — 시장의 편향이 현실을 바꾼다고 본다',
      en: 'Reflexivity — market bias reshapes the fundamentals',
      ja: '再帰性理論 — 市場の偏りが現実を変えると見る',
    },
  },
  tepper: {
    style: 'macro',
    person: { ko: '데이비드 테퍼', en: 'David Tepper', ja: 'デビッド・テッパー' },
    bio: {
      ko: '위기 국면에 과감히 들어가는 디스트레스드 투자자',
      en: 'Distressed investor who leans in when markets panic',
      ja: '危機局面に果敢に入るディストレスト投資家',
    },
  },
  simons: {
    style: 'macro',
    person: { ko: '짐 사이먼스', en: 'Jim Simons', ja: 'ジム・シモンズ' },
    bio: {
      ko: '수학자가 세운 퀀트 펀드 — 통계 모델이 판단한다',
      en: 'Mathematician-founded quant fund driven by models',
      ja: '数学者が創ったクオンツファンド — モデルが判断する',
    },
  },
  burry: {
    style: 'contrarian',
    person: { ko: '마이클 버리', en: 'Michael Burry', ja: 'マイケル・バーリ' },
    bio: {
      ko: '서브프라임을 공매도한 역발상 투자자',
      en: 'The contrarian who shorted subprime',
      ja: 'サブプライムを空売りした逆張り投資家',
    },
  },
  einhorn: {
    style: 'contrarian',
    person: { ko: '데이비드 아인혼', en: 'David Einhorn', ja: 'デビッド・アインホーン' },
    bio: {
      ko: '공매도 리서치로 이름을 알린 가치·이벤트 투자자',
      en: 'Made his name on short research; value and event-driven',
      ja: '空売りリサーチで名を上げたバリュー・イベント投資家',
    },
  },
};

/** 프로필이 등록된 거장 키 목록 — 상세 라우트 정적 생성(generateStaticParams)에 사용. */
export const GURU_KEYS: string[] = Object.keys(GURU_PROFILES);

/** 스타일 조회 — 미등록 키는 가치 투자로 폴백(그룹이 비어 보이지 않도록). */
export function styleOf(investorKey?: string): GuruStyle {
  return (investorKey && GURU_PROFILES[investorKey]?.style) || 'value';
}

/** 인물명 현지 표기 — 미등록 키는 백엔드 원문(영문)을 그대로 쓴다. */
export function personOf(
  investorKey: string | undefined,
  lang: Language,
  fallback: string,
): string {
  return (investorKey && GURU_PROFILES[investorKey]?.person[lang]) || fallback;
}

/** 한 줄 소개 — 미등록 키는 undefined (화면에서 줄 자체를 생략). */
export function bioOf(investorKey: string | undefined, lang: Language): string | undefined {
  return investorKey ? GURU_PROFILES[investorKey]?.bio[lang] : undefined;
}

/**
 * 인물명 이니셜 — 아바타 자리표시자 ('Warren Buffett' → 'WB').
 * 현지 표기명이 아니라 백엔드 영문명을 넣을 것 (한글명은 '워버'처럼 읽히지 않는다).
 */
export function initialsOf(person: string): string {
  const parts = person.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}
