import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { getColorForValue } from "@/lib/mapUtils";

interface ColorLegendProps {
  min: number | null;
  max: number | null;
  parameterName: string;
  year: number;
}

export default function ColorLegend({ min, max, parameterName, year }: ColorLegendProps) {
  // Create formatted min and max values for display
  const formattedMin = min !== null ? formatValue(min) : '0';
  const middle = min !== null && max !== null ? formatValue((min + max) / 2) : '';
  const formattedMax = max !== null ? formatValue(max) : '';
  console.log(max);
  // Format value based on magnitude
  function formatValue(value: number | null | undefined): string {
    
    if (value === null || value === undefined) {
      console.log("najdu") 
      return '-';
    }
    if (value >= 1000) {
      return `${Math.round(value).toLocaleString('sl-SI')}€`;
    } else {
      return value.toLocaleString('sl-SI');
    }
  }
  
  // Generate color gradient using the same color scale as the map
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
          {/* Color gradient bar */}
          <div className="flex h-6 rounded-sm overflow-hidden border border-gray-200">
            {colors.map((color, index) => (
              <div 
                key={index} 
                className="flex-1" 
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
          
          {/* Value labels */}
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium text-neutral-dark">{formattedMin}</span>
            {middle && (
              <span className="text-xs text-neutral-dark">{middle}</span>
            )}
            <span className="text-xs font-medium text-neutral-dark">{formattedMax}</span>
          </div>
        </div>
        
        {/* Parameter info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium text-neutral-darkest">{parameterName}</p>
          <p className="text-xs text-neutral-dark mt-1">Leto {year}</p>
        </div>
      </div>
    </div>
  );
}
