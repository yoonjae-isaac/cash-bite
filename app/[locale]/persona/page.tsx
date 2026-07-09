import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/ui/Reveal';
import PersonaPage from '@/views/PersonaPage';
import { FEATURES } from '@/config/features';

// 내 종목 평가(persona)는 임시 미노출 — FEATURES.persona=false 면 404. 플래그 true 로 즉시 복구.
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!FEATURES.persona) notFound();
  return (
    <Reveal>
      <PersonaPage />
    </Reveal>
  );
}
