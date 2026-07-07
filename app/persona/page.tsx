import { notFound } from 'next/navigation';
import Reveal from '../../src/components/ui/Reveal';
import PersonaPage from '../../src/views/PersonaPage';
import { FEATURES } from '../../src/config/features';

// 내 종목 평가(persona)는 임시 미노출 — FEATURES.persona=false 면 404. 플래그 true 로 즉시 복구.
export default function Page() {
  if (!FEATURES.persona) notFound();
  return (
    <Reveal>
      <PersonaPage />
    </Reveal>
  );
}
