/**
 * 주린이 온보딩 콘텐츠 타입 (국내 전용 · 한국어).
 *
 * onboarding.json 의 스키마. 프레젠테이션(어떤 앱/프레임워크로 그리든)과 분리된
 * 콘텐츠 단일 소스이며, 이 타입만 지키면 어느 앱에서도 그대로 소비할 수 있다.
 *
 * 사용 예:
 *   import data from './onboarding.json';
 *   import type { OnboardingContent } from './types';
 *   const content = data as OnboardingContent;
 */

export type StepId =
  | 'mindset'
  | 'account'
  | 'terms'
  | 'buyWhat'
  | 'checklist'
  | 'afterBuy';

/** 온보딩에서 다른 (기존/외부) 화면으로 연결되는 링크. `to` 는 대상 화면의 키. */
export interface CrossLink {
  to: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/* meta                                                               */
/* ------------------------------------------------------------------ */

export interface OnboardingMeta {
  id: string;
  title: string;
  description: string;
  locale: 'ko';
  /** 국내 전용 — 다국어 미지원. */
  i18n: false;
  market: 'KR';
  version: string;
  /** 콘텐츠 기준 시점 (예: "2026-07"). 세율·한도 유효성 판단에 사용. */
  asOf: string;
  source: string;
  /** 하단 고정 면책 고지. */
  disclaimer: string;
  verification: {
    method: string;
    note: string;
    /** 출시 전 1차 출처로 반드시 재확인해야 하는 수치·항목. */
    productionCautions: string[];
  };
}

/* ------------------------------------------------------------------ */
/* home — 홈(정문) 화면 카피                                           */
/* ------------------------------------------------------------------ */

export interface HomeCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  journeyLabel: string;
  openerCardSubtitle: string;
}

/* ------------------------------------------------------------------ */
/* opener — "왜 투자를 해야 할까?"                                     */
/* ------------------------------------------------------------------ */

export interface HeadingBlock {
  heading: string;
  body: string;
}

export interface MoneyLayer {
  /** "1층" | "2층" | "3층" */
  level: string;
  title: string;
  desc: string;
  /** 강조 표시할 층(=투자 층). */
  emphasis: boolean;
}

export interface Opener {
  id: 'why-invest';
  title: string;
  kicker: string;
  readingTime: string;
  intro: string;
  blocks: HeadingBlock[];
  /** 실질수익률 수식 조각 (예: ["예금 이자 3.0%", "−", "물가 3.5%", "=", "실질 −0.5% 손해"]). */
  formula: { caption: string; parts: string[] };
  moneyLayers: MoneyLayer[];
  keyTakeaway: string;
}

/* ------------------------------------------------------------------ */
/* journey (홈 카드 메타)                                              */
/* ------------------------------------------------------------------ */

export interface JourneyItem {
  step: number;
  id: StepId;
  title: string;
  subtitle: string;
}

/* ------------------------------------------------------------------ */
/* step 1 — mindset (트레이더 / 가치투자자)                            */
/* ------------------------------------------------------------------ */

export interface MindsetArticle {
  title: string;
  body: string;
  /** 참고 인물 (선택). */
  cite?: string;
}

export interface MindsetTrack {
  label: string;
  tagline: string;
  /** 프레젠테이션 액센트 힌트. */
  accent: 'trader' | 'value';
  intro: string;
  articles: MindsetArticle[];
}

export interface MindsetStep {
  id: 'mindset';
  step: 1;
  title: string;
  intro: string;
  personaHook: string;
  completeLabel: string;
  tracks: { trader: MindsetTrack; value: MindsetTrack };
}

/* ------------------------------------------------------------------ */
/* step 2 — account (증권사 · 세금 · 환전 · ISA)                       */
/* ------------------------------------------------------------------ */

export interface NumberedBlock {
  n: number;
  title: string;
  body: string;
}

export interface Broker {
  name: string;
  oneLiner: string;
  points: string[];
}

export interface TaxRow {
  topic: string;
  /** 국내주식 기준 서술. */
  kr: string;
  /** 미국(해외)주식 기준 서술. */
  us: string;
}

export interface IsaType {
  name: string;
  benefit: string;
  who: string;
}

export interface AccountStep {
  id: 'account';
  step: 2;
  title: string;
  intro: string;
  openSteps: NumberedBlock[];
  /** 증권사 목록이 전체가 아닌 대표 일부라는 안내 문구. */
  brokersIntro: string;
  brokers: Broker[];
  krVsUs: { intro: string; rows: TaxRow[]; takeaway: string };
  fxRisk: { heading: string; body: string; example: string };
  isa: {
    analogy: string;
    whatItSaves: string;
    types: IsaType[];
    limits: string;
    caution: string;
  };
}

/* ------------------------------------------------------------------ */
/* step 3 — terms                                                     */
/* ------------------------------------------------------------------ */

export interface TermItem {
  term: string;
  def: string;
}

export interface TermsStep {
  id: 'terms';
  step: 3;
  title: string;
  intro: string;
  items: TermItem[];
  crosslink: CrossLink;
}

/* ------------------------------------------------------------------ */
/* step 4 — buyWhat / step 6 — afterBuy (title+body 포인트형)          */
/* ------------------------------------------------------------------ */

export interface TitleBody {
  title: string;
  body: string;
}

export interface PointsStep {
  id: 'buyWhat' | 'afterBuy';
  step: 4 | 6;
  title: string;
  intro: string;
  points: TitleBody[];
  callout?: string;
  crosslink?: CrossLink;
}

/* ------------------------------------------------------------------ */
/* step 5 — checklist                                                 */
/* ------------------------------------------------------------------ */

export interface ChecklistItem {
  n: number;
  q: string;
  body: string;
}

export interface ChecklistStep {
  id: 'checklist';
  step: 5;
  title: string;
  intro: string;
  items: ChecklistItem[];
}

/* ------------------------------------------------------------------ */
/* root                                                               */
/* ------------------------------------------------------------------ */

export interface OnboardingSteps {
  mindset: MindsetStep;
  account: AccountStep;
  terms: TermsStep;
  buyWhat: PointsStep;
  checklist: ChecklistStep;
  afterBuy: PointsStep;
}

export interface OnboardingContent {
  meta: OnboardingMeta;
  home: HomeCopy;
  opener: Opener;
  journey: JourneyItem[];
  steps: OnboardingSteps;
}
