import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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
  
  // Format value based on magnitude
  function formatValue(value: number): string {
    if (value >= 1000) {
      return `${Math.round(value).toLocaleString('sl-SI')}€`;
    } else {
      return value.toLocaleString('sl-SI');
    }
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Legenda</h2>
      
      <div className="space-y-2">
        <div className="flex flex-col">
          <div className="flex h-6 rounded-sm overflow-hidden">
            <div className="w-1/9 bg-[hsl(var(--chart-1))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-2))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-3))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-4))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-5))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-6))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-7))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-8))]"></div>
            <div className="w-1/9 bg-[hsl(var(--chart-9))]"></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-dark">{formattedMin}</span>
            <span className="text-xs text-neutral-dark">{middle}</span>
            <span className="text-xs text-neutral-dark">{formattedMax}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-sm font-medium">{parameterName}</p>
            <p className="text-xs text-neutral-dark">Leto {year}</p>
          </div>
          
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-dark">
            Podrobnosti
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
