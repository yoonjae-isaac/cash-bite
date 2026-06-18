import { useState } from 'react';
import type { SupportedCurrency } from '../../domain/exchange/types';
import { CURRENCY_SYMBOLS } from '../../domain/exchange/constants';

/**
 * Format a raw numeric string with thousands-comma separators.
 * KRW/JPY are treated as whole numbers; USD preserves decimal portion.
 */
function formatCurrencyDisplay(raw: string, currency: SupportedCurrency): string {
  if (!raw || raw === '.' || raw === '') return raw;

  const isWholeNumber = currency === 'KRW' || currency === 'JPY';

  if (isWholeNumber) {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return raw;
    return n.toLocaleString('en-US');
  }

  // USD: preserve any trailing decimal characters the user is typing
  const parts = raw.split('.');
  const intPart = parseInt(parts[0] || '0', 10);
  const intFormatted = isNaN(intPart) ? '0' : intPart.toLocaleString('en-US');
  if (parts.length > 1) {
    return `${intFormatted}.${parts[1]}`;
  }
  return intFormatted;
}

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string) => void;
  currency: SupportedCurrency;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Controlled input that shows comma-formatted values when blurred
 * and the raw numeric string when focused. Accepts only valid numeric input.
 */
const CurrencyInput = ({
  value,
  onChange,
  currency,
  placeholder,
  disabled,
  className = '',
}: CurrencyInputProps) => {
  const [focused, setFocused] = useState(false);

  const symbol = CURRENCY_SYMBOLS[currency];
  const displayValue = focused ? value : formatCurrencyDisplay(value, currency);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '') {
      onChange('');
      return;
    }
    const isWholeNumber = currency === 'KRW' || currency === 'JPY';
    const pattern = isWholeNumber ? /^\d+$/ : /^\d*\.?\d*$/;
    if (!pattern.test(raw)) return;
    onChange(raw);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cb-muted text-sm font-semibold pointer-events-none select-none">
        {symbol}
      </span>
      <input
        type="text"
        inputMode={currency === 'USD' ? 'decimal' : 'numeric'}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full theme-field border rounded-lg py-3 pl-8 pr-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono ${className}`}
      />
    </div>
  );
};

export default CurrencyInput;
