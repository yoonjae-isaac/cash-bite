import { Briefcase, CalendarDays, FileText, Wallet } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { toQuarterLabel, type GuruPortfolio } from '../../domain/guru/types';
import { formatUsd13F } from '../../domain/guru/format';

const GuruSummary = ({ portfolio }: { portfolio: GuruPortfolio }) => {
  const t = useLanguageStore((s) => s.t);

  const cards = [
    {
      icon: <Wallet className="w-4 h-4" />,
      label: t.gurus.totalValue,
      value: formatUsd13F(portfolio.totalValue),
      accent: true,
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: t.gurus.positions,
      value: `${portfolio.positionCount} ${t.gurus.positionsUnit}`,
      accent: false,
    },
    {
      icon: <CalendarDays className="w-4 h-4" />,
      label: t.gurus.reportQuarter,
      value: toQuarterLabel(portfolio.reportDate),
      accent: false,
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: t.gurus.filedAt,
      value: portfolio.filingDate,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-cb-muted text-xs font-medium mb-1.5">
            {card.icon}
            {card.label}
          </div>
          <p
            className={[
              'text-xl md:text-2xl font-bold',
              card.accent ? 'text-cb-accent' : 'text-cb-foreground',
            ].join(' ')}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default GuruSummary;
