import { Card, CardContent } from "@/components/ui/card";

interface DataSummaryProps {
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  };
}

export default function DataSummary({ stats }: DataSummaryProps) {
  // Format number with Slovenian locale
  const formatNumber = (value: number | null): string => {
    if (value === null) return '-';
    
    return value.toLocaleString('sl-SI', {
      maximumFractionDigits: 2
    });
  };
  
  // Add euro sign for monetary values if needed
  const formatWithUnit = (value: string): string => {
    if (value === '-') return value;
    return `${value}€`;
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Statistika</h2>
      
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-dark">Povprečje</p>
              <p className="text-lg font-semibold">{formatWithUnit(formatNumber(stats.avg))}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-dark">Mediana</p>
              <p className="text-lg font-semibold">{formatWithUnit(formatNumber(stats.median))}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-dark">Minimum</p>
              <p className="text-lg font-semibold">{formatWithUnit(formatNumber(stats.min))}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-dark">Maksimum</p>
              <p className="text-lg font-semibold">{formatWithUnit(formatNumber(stats.max))}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
