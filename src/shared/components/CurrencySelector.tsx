import type { SupportedCurrency } from '../../domain/exchange/types';
import { useCurrencyStore } from '../../application/currency/useCurrencyStore';

const OPTIONS: { value: SupportedCurrency; flag: string }[] = [
  { value: 'USD', flag: '🇺🇸' },
  { value: 'KRW', flag: '🇰🇷' },
  { value: 'JPY', flag: '🇯🇵' },
];

interface CurrencySelectorProps {
  /** Show full flag+label version (default) or compact label-only version */
  compact?: boolean;
}

const CurrencySelector = ({ compact = false }: CurrencySelectorProps) => {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div className="flex rounded-lg border border-cb-border overflow-hidden">
      {OPTIONS.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => setCurrency(opt.value)}
          className={[
            'flex items-center gap-1 py-1.5 text-xs font-bold transition-colors',
            compact ? 'px-2.5' : 'px-3',
            i > 0 ? 'border-l border-cb-border' : '',
            currency === opt.value
              ? 'bg-cb-accent/20 text-cb-accent'
              : 'text-cb-muted hover:text-cb-foreground hover:bg-[var(--cb-hover)]',
          ].join(' ')}
        >
          <span>{opt.flag}</span>
          <span>{opt.value}</span>
        </button>
      ))}
    </div>
  );
};

export default CurrencySelector;
