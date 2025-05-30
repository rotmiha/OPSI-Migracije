import { getColorForValue } from "@/lib/mapUtils";

interface ColorLegendProps {
  min: number | null;
  max: number | null;
  parameterName: string;
  year: number;
}

// Funkcija za pridobitev enote glede na parameter
function getUnitForParameter(parameterName: string): string {
  const units: Record<string, string> = {
    "Povprečni dohodek": "€",
    "Temperatura": "°C",
    "Prebivalstvo": "",
    "Onesnaženost": "µg/m³",
    // Dodaj ostale parametre po potrebi
  };
  return units[parameterName] || "";
}

export default function ColorLegend({ min, max, parameterName, year }: ColorLegendProps) {
  const unit = getUnitForParameter(parameterName);

  // Formatiranje vrednosti z enoto
  function formatValue(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return `${value.toLocaleString('sl-SI')}${unit}`;
  }

  const formattedMin = formatValue(min);
  const formattedMax = formatValue(max);
  const showMiddle = min !== null && max !== null && Math.abs(max - min) > 0.01;
  const middle = showMiddle ? formatValue((min! + max!) / 2) : '';

  // Generiranje barvnega preliva
  const generateColorGradient = () => {
    if (min === null || max === null) return [];
    const steps = 10;
    const colors = [];
    for (let i = 0; i < steps; i++) {
      const value = min + (max - min) * (i / (steps - 1));
      const color = getColorForValue(value, min, max);
      colors.push(color);
    }
    return colors;
  };

  const colors = generateColorGradient();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Barvna legenda</h2>

      <div className="space-y-3">
        <div className="flex flex-col">
          {/* Barvni preliv */}
          <div className="flex h-6 rounded-sm overflow-hidden border border-gray-200">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>

          {/* Oznake vrednosti */}
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium text-neutral-dark">{formattedMin}</span>
            {showMiddle && (
              <span className="text-xs text-neutral-dark">{middle}</span>
            )}
            <span className="text-xs font-medium text-neutral-dark">{formattedMax}</span>
          </div>

          {/* Enota pod lestvico */}
          {unit && (
            <div className="text-xs text-neutral-dark mt-1 text-center">
              Enota: {unit}
            </div>
          )}
        </div>

        {/* Informacije o parametru */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium text-neutral-darkest">{parameterName}</p>
          <p className="text-xs text-neutral-dark mt-1">Leto {year}</p>
        </div>
      </div>
    </div>
  );
}
