import { ArrowUp, ArrowDown } from 'lucide-react';
import { useUpDownStore } from '../../../application/preferences/useUpDownStore';
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const SWAP_LABEL: Record<string, string> = {
  ko: '상승/하락 색 전환',
  en: 'Swap up/down colors',
  ja: '上昇/下落の色を切替',
};

/**
 * 상승/하락 색 스위칭 버튼 — 상승↔하락 색을 맞바꾼다.
 * 화살표 색이 --cb-positive/--cb-negative 를 그대로 써서 현재 매핑을 즉시 보여준다.
 */
const UpDownToggle = () => {
  const mode = useUpDownStore((s) => s.mode);
  const toggle = useUpDownStore((s) => s.toggle);
  const lang = useLanguageStore((s) => s.language);
  const label = SWAP_LABEL[lang] ?? SWAP_LABEL.ko;

  return (
    <button
      type="button"
      onClick={() => {
        const next = mode === 'swap' ? 'default' : 'swap';
        trackEvent('updown_color_changed', { mode: next });
        toggle();
      }}
      aria-label={label}
      title={label}
      className="p-1.5 rounded-lg border border-cb-border bg-cb-surface/70 text-cb-muted hover:border-cb-accent/35 transition-colors flex items-center"
    >
      <ArrowUp className="w-3 h-3 text-cb-positive" strokeWidth={3} />
      <ArrowDown className="w-3 h-3 text-cb-negative -ml-0.5" strokeWidth={3} />
    </button>
  );
};

export default UpDownToggle;
