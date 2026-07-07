import type { Metadata } from 'next';
import Reveal from '../../src/components/ui/Reveal';
import MacroPage from '../../src/views/MacroPage';
import { pageMetadata } from '../../src/config/site';

export const metadata: Metadata = pageMetadata({
  title: '거시지표',
  description: '미국 금리·물가·고용 등 핵심 거시지표와 금리 방향 전망을 한눈에.',
  path: '/macro',
});

export default function Page() {
  return (
    <Reveal>
      <MacroPage />
    </Reveal>
  );
}
