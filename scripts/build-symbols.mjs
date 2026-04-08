#!/usr/bin/env node
/**
 * 정적 심볼 카탈로그 생성 뼈대.
 * CSV 또는 증권 API 등에서 데이터를 읽어 `public/symbols.json` 형식
 * `[["TICKER","Name"], ...]` 으로 쓰도록 확장하면 됩니다.
 *
 * 예: node scripts/build-symbols.mjs
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'public', 'symbols.json');

/** TODO: CSV/API에서 읽어 이 배열을 채우세요. */
const rows = [
  ['AAPL', 'Apple Inc.'],
  ['MSFT', 'Microsoft Corporation'],
  ['GOOGL', 'Alphabet Inc.'],
  ['005930', '삼성전자'],
  ['000660', 'SK하이닉스'],
  ['TSLA', 'Tesla, Inc.'],
];

await writeFile(outPath, `${JSON.stringify(rows)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
