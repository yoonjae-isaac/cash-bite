'use client';

import { useState } from 'react';
import { getTool } from '../../domain/tools/catalog';

/**
 * 제네릭 계산기 — slug 로 catalog 의 ToolCalc(inputs + compute)를 클라이언트에서 조회해 렌더.
 * (compute 는 함수라 서버→클라 prop 직렬화 불가 → slug 만 전달받고 여기서 resolve)
 * 입력값 변경 시 즉시 재계산. 값은 문자열로 보관하고 계산 시 숫자로 파싱(빈칸=0).
 */
export default function Calculator({ slug }: { slug: string }) {
  const tool = getTool(slug);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const input of tool?.inputs ?? []) {
      init[input.key] = String(input.defaultValue);
    }
    return init;
  });

  if (!tool) {
    return null;
  }

  const numeric: Record<string, number> = {};
  for (const input of tool.inputs) {
    const parsed = parseFloat(values[input.key]);
    numeric[input.key] = Number.isFinite(parsed) ? parsed : 0;
  }
  const results = tool.compute(numeric);

  return (
    <div className="glass-panel p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tool.inputs.map((input) => (
          <label key={input.key} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-cb-muted">
              {input.label}
              {input.unit ? ` (${input.unit})` : ''}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={input.step ?? 1}
              value={values[input.key]}
              onChange={(e) => setValues((s) => ({ ...s, [input.key]: e.target.value }))}
              className="theme-field border px-3 py-2 text-sm text-cb-foreground font-mono tabular-nums focus:outline-none focus:border-cb-accent/50"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 pt-5 border-t border-cb-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        {results.map((r, i) => (
          <div
            key={i}
            className={[
              'rounded-xl p-3.5 border',
              r.emphasize ? 'border-cb-accent/35 bg-cb-accent/5' : 'border-cb-border theme-row',
            ].join(' ')}
          >
            <div className="text-xs text-cb-muted mb-1">{r.label}</div>
            <div
              className={[
                'font-bold tabular-nums',
                r.emphasize ? 'text-xl text-cb-accent' : 'text-lg text-cb-foreground',
              ].join(' ')}
            >
              {r.value}
              {r.unit && <span className="text-xs font-normal text-cb-muted ml-1">{r.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
