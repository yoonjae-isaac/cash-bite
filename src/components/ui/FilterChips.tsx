'use client';

export interface FilterChipOption<T extends string> {
  id: T;
  label: string;
  count?: number; // 칩에 건수를 함께 노출 (0 이면 비활성)
}

/**
 * 건수를 함께 보여주는 필터 칩 그룹.
 * 목록을 좁히기 전에 "각 분류에 몇 건 있는지"를 먼저 알려주는 용도라, count 를 라벨 옆에 붙인다.
 */
function FilterChips<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.id === value;
        const disabled = opt.count === 0;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => !disabled && onChange(opt.id)}
            disabled={disabled}
            aria-pressed={active}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors',
              active
                ? 'border-cb-accent bg-cb-accent text-cb-on-accent'
                : disabled
                  ? 'border-cb-border text-cb-muted/50 cursor-not-allowed'
                  : 'border-cb-border text-cb-muted hover:text-cb-foreground theme-hover',
            ].join(' ')}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={active ? 'opacity-80' : 'text-cb-muted/80'}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
