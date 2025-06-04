import { getColorForValue } from "@/lib/mapUtils";

interface ColorLegendProps {
  min: number | null;
  max: number | null;
  parameterName: string;
  year: number;
}

// Funkcija za določanje enote glede na parameter
function getUnitForParameter(parameterName: string): string {
  const eurParameters = [
    "Bruto dohodek - SKUPAJ",
    "Dohodek iz dela",
    "Starševski, družinski in socialni prejemki",
    "Pokojnine",
    "Dohodek iz premoženja, kapitala in drugi"
  ];

  const peopleParameters = [
    "Izobrazba - SKUPAJ",
    "Terciarna izobrazba",
    "Srednješolska izobrazba",
    "Osnovnošolska ali manj",
    "Delovno aktivni v občini prebivališča",
    "Delovno aktivni v občini prebivališča - moški",
    "Delovno aktivni v občini prebivališča - ženske"
  ];

  if (eurParameters.includes(parameterName)) {
    return "€";
  } else if (peopleParameters.includes(parameterName)) {
    return "ljudi";
  }

  return ""; // privzeta enota, če parameter ni prepoznan
}

export default function ColorLegend({ min, max, parameterName, year }: ColorLegendProps) {
  const unit = getUnitForParameter(parameterName);

  function formatValue(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return `${value.toLocaleString('sl-SI')}${unit ? ` ${unit}` : ''}`;
  }

  const formattedMin = formatValue(min);
  const formattedMax = formatValue(max);
  const showMiddle = min !== null && max !== null && Math.abs(max - min) > 0.01;
  const middle = showMiddle ? formatValue((min! + max!) / 2) : '';

  const isUnreliableYear = year >= 2025 && year <= 2027;

  const generateColorGradient = () => {
    if (min === null || max === null) return [];
    const steps = 10;

    if (isUnreliableYear) {
      // Red shades for unreliable data
      return [
        "#ffe5e5", "#ffcccc", "#ffb3b3", "#ff9999", "#ff8080",
        "#ff6666", "#ff4d4d", "#ff3333", "#ff1a1a", "#e60000"
      ];
    }

    // Normal gradient from getColorForValue
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
        </div>

        {/* Informacije o parametru */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium text-neutral-darkest">{parameterName}</p>
          <p className="text-xs text-neutral-dark mt-1">Leto {year}</p>
          {isUnreliableYear && (
            <p className="text-xs text-red-600 mt-1 font-semibold">
              Podatki za to leto niso zanesljivi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
