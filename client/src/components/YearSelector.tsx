import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BsPlay, BsPauseCircle } from "react-icons/bs";

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number) => void;
}

export default function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
}: YearSelectorProps) {
  const minYear = availableYears.length ? Math.min(...availableYears) : 2014;
  const maxYear = availableYears.length ? Math.max(...availableYears) : 2023;
  const initialYear =
    selectedYear ??
    (availableYears.includes(2024)
      ? 2024
      : availableYears.includes(2023)
      ? 2023
      : maxYear);

  const [sliderValue, setSliderValue] = useState<number[]>([initialYear]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef    = useRef(
    selectedYear !== null ? availableYears.indexOf(selectedYear) : 0
  );

  useEffect(() => {
    if (selectedYear !== null) {
      indexRef.current = availableYears.indexOf(selectedYear);
      setSliderValue([selectedYear]);
    }
  }, [selectedYear, availableYears]);

  const startPlaying = () => {
    if (isPlaying || !availableYears.length) return;
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % availableYears.length;
      onYearChange(availableYears[indexRef.current]);
    }, 750);
  };

  const stopPlaying = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  };

  useEffect(() => () => stopPlaying(), []);

  const handleSliderChange = ([rawValue]: number[]) => {
    const closest = availableYears.reduce((p, c) =>
      Math.abs(c - rawValue) < Math.abs(p - rawValue) ? c : p
    );
    onYearChange(closest);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Leto</h2>

      {/* PLAY / PAUSE */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={startPlaying}
          className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-lg hover:bg-primary/80 transition"
          title="Predvajaj vizualizacijo"
        >
          <BsPlay />
        </button>
        <button
          onClick={stopPlaying}
          className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-lg hover:bg-primary/80 transition"
          title="Zaustavi vizualizacijo"
        >
          <BsPauseCircle />
        </button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-dark">{minYear}</span>
        <span className="text-sm font-medium">{maxYear}</span>
      </div>

      <div className="mb-4">
        <Slider
          value={sliderValue}
          min={minYear}
          max={maxYear}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {availableYears.map((year) => (
         <Badge
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            className={[
              "cursor-pointer",
              selectedYear === year && [2025, 2026, 2027].includes(year)
                ? "bg-red-700 text-white"
                : selectedYear === year
                ? "bg-primary text-white"
                : [2025, 2026, 2027].includes(year)
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary-light text-primary hover:bg-primary hover:text-white"
            ].join(" ")}
            onClick={() => onYearChange(year)}
          >
            {year}
          </Badge>
        ))}
      </div>
    </div>
  );
}
