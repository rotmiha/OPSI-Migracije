import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BsGraphUpArrow } from "react-icons/bs";

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ 
  availableYears, 
  selectedYear, 
  onYearChange 
}: YearSelectorProps) {
  // Set min and max years from available years
  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : 2014;
  const maxYear = availableYears.length > 0 ? Math.max(...availableYears) : 2023;
  
  // Set slider value based on selected year
  const initialYear = selectedYear 
  ?? (availableYears.includes(2024) ? 2024 
  : availableYears.includes(2023) ? 2023 
  : maxYear);

const [sliderValue, setSliderValue] = useState<number[]>([initialYear]);
  
  // Update slider when selected year changes
  useEffect(() => {
    if (selectedYear) {
      setSliderValue([selectedYear]);
    }
  }, [selectedYear]);
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newYear = value[0];
    setSliderValue([newYear]);
    
    // Find closest available year
    if (availableYears.length > 0) {
      const closestYear = availableYears.reduce((prev, curr) => 
        Math.abs(curr - newYear) < Math.abs(prev - newYear) ? curr : prev
      );
      onYearChange(closestYear);
    }
  };
  
  // Handle year pill click
  const handleYearClick = (year: number) => {
    onYearChange(year);
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Leto  </h2>
      
      {/* Year Range Display */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-dark">{minYear}</span>
        <span className="text-sm font-medium">{maxYear}</span>
      </div>
      
      {/* Year Slider */}
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
      
      {/* Available Years Pills */}
      <div className="flex flex-wrap gap-2">
        {availableYears.map((year) => (
        <Badge 
          key={year} 
          variant={selectedYear === year ? "default" : "outline"}
          className={
            [
              "cursor-pointer",
              selectedYear === year 
                ? "bg-primary text-white" 
                : "bg-primary-light text-primary hover:bg-primary hover:text-white",
              [2025, 2026, 2027].includes(year) 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : ""
            ].join(" ")
          }
          onClick={() => handleYearClick(year)}
        >
          {year}
        </Badge>
        ))}
      </div>
    </div>
  );
}
