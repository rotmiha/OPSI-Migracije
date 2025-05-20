import { Button } from "@/components/ui/button";
import { X, Eye, ChevronRight } from "lucide-react";

interface MunicipalityDetailProps {
  municipalityName: string;
  data: {
    municipality: string;
    value: number | null;
  };
  parameterName: string;
  year: number | null;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  } | undefined;
  onClose: () => void;
}

export default function MunicipalityDetail({
  municipalityName,
  data,
  parameterName,
  year,
  stats,
  onClose
}: MunicipalityDetailProps) {
  // Format number with Slovenian locale
  const formatNumber = (value: number | null): string => {
    if (value === null) return '-';
    
    return value.toLocaleString('sl-SI', {
      maximumFractionDigits: 2
    });
  };
  
  // Calculate percentage for progress bar
  const calculatePercentage = (): number => {
    if (!data.value || !stats || stats.min === null || stats.max === null) return 0;
    
    const min = stats.min;
    const max = stats.max;
    
    if (max === min) return 50; // Avoid division by zero
    
    return ((data.value - min) / (max - min)) * 100;
  };
  
  return (
    <div className="absolute right-6 bottom-6 w-80 bg-white rounded-lg shadow-lg border border-neutral-light overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-neutral-darkest">{municipalityName}</h3>
            <p className="text-neutral-dark text-sm">Slovenija</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1 rounded-full hover:bg-neutral-lighter"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-neutral-dark" />
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-dark">{parameterName} ({year})</span>
            <span className="font-semibold">{formatNumber(data.value)}€</span>
          </div>
          
          <div className="h-2 w-full bg-neutral-lighter rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${calculatePercentage()}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-neutral-dark mt-1">
            <span>{formatNumber(stats?.min)}€</span>
            <span>{formatNumber(stats?.max)}€</span>
          </div>
        </div>
        
        {/* Other related parameters - would be populated if we had related data */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-dark">Povprečje</span>
            <span className="font-medium">{formatNumber(stats?.avg)}€</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-dark">Mediana</span>
            <span className="font-medium">{formatNumber(stats?.median)}€</span>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-lighter px-4 py-3 flex justify-between">
        <Button variant="ghost" size="sm" className="text-sm text-neutral-dark hover:text-primary flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          Prikaži vse podatke
        </Button>
        <Button variant="ghost" size="sm" className="text-sm text-primary flex items-center">
          <ChevronRight className="w-4 h-4 mr-1" />
          Zgodovina
        </Button>
      </div>
    </div>
  );
}
