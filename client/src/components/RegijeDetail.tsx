import { Button } from "@/components/ui/button";
import { X, Eye, ChevronRight, Info } from "lucide-react";
import { useEffect, useState } from "react";

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

  if (eurParameters.includes(parameterName)) return "€";
  if (peopleParameters.includes(parameterName)) return "people";
  return "";
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
  const monetaryParameters = [
    "Bruto dohodek - SKUPAJ",
    "Dohodek iz dela",
    "Starševski, družinski in socialni prejemki",
    "Pokojnine",
    "Dohodek iz premoženja, kapitala in drugi",
  ];
  const isMonetary = monetaryParameters.includes(parameterName);

  const getParameterExplanation = (param: string): { title: string; description: string } => {
    const explanations: Record<string, { title: string; description: string }> = {
      "Bruto dohodek - SKUPAJ": {
        title: "Bruto dohodek - SKUPAJ",
        description: "Skupni znesek vseh prejetih bruto dohodkov posameznika (vključno z dohodki iz dela, pokojninami itd.)."
      },
      "Dohodek iz dela": {
        title: "Dohodek iz dela",
        description: "Dohodki iz zaposlitve, samozaposlitve ali drugega plačanega dela."
      },
      "Starševski, družinski in socialni prejemki": {
        title: "Starševski, družinski in socialni prejemki",
        description: "Vključuje otroške dodatke, nadomestila za starševstvo, socialno pomoč ipd."
      },
      "Pokojnine": {
        title: "Pokojnine",
        description: "Dohodki posameznikov, ki so jih prejeli kot pokojnino po upokojitvi."
      },
      "Dohodek iz premoženja, kapitala in drugi": {
        title: "Dohodek iz premoženja, kapitala in drugi",
        description: "Vključuje najemnine, dividende, obresti in druge ne-delovne dohodke."
      },
      "Izobrazba - SKUPAJ": {
        title: "Izobrazba - SKUPAJ",
        description: "Delež prebivalstva glede na doseženo izobrazbo (skupno)."
      },
      "Terciarna izobrazba": {
        title: "Terciarna izobrazba",
        description: "Višješolska, visokošolska, magistrska ali doktorska izobrazba."
      },
      "Srednješolska izobrazba": {
        title: "Srednješolska izobrazba",
        description: "Vključuje poklicno in splošno srednješolsko izobrazbo."
      },
      "Osnovnošolska ali manj": {
        title: "Osnovnošolska ali manj",
        description: "Prebivalstvo z največ osnovnošolsko izobrazbo ali brez nje."
      },
      "Indeks delovne migracije": {
        title: "Indeks delovne migracije",
        description: "Razmerje med številom zaposlenih, ki delajo izven občine prebivališča, in številom delovno aktivnih v občini."
      },
      "Indeks delovne migracije - moški": {
        title: "Indeks delovne migracije - moški",
        description: "Indeks delovne migracije ločeno za moške."
      },
      "Indeks delovne migracije - ženske": {
        title: "Indeks delovne migracije - ženske",
        description: "Indeks delovne migracije ločeno za ženske."
      },
      "Delovno aktivni v občini prebivališča": {
        title: "Delovno aktivni v občini prebivališča",
        description: "Delovno aktivni, ki delajo v občini prebivališča na 100 delovno aktivnih prebivalcev."
      },
      "Delovno aktivni v občini prebivališča - moški": {
        title: "Delovno aktivni v občini prebivališča - moški",
        description: "Delovno aktivni moški, ki delajo v občini prebivališča na 100 delovno aktivnih prebivalcev.."
      },
      "Delovno aktivni v občini prebivališča - ženske": {
        title: "Delovno aktivni v občini prebivališča - ženske",
        description: "Delovno aktivne ženske, ki delajo v občini prebivališča na 100 delovno aktivnih prebivalcev.a."
      }
    };

    return explanations[param] || { title: param, description: "Razlaga za ta parameter ni na voljo." };
  };

  const [showExplanation, setShowExplanation] = useState(false);
  const currentExplanation = getParameterExplanation(parameterName);

  const formatNumber = (value: number | null): string => {
    if (value == null) return "-";

    const formatted = value.toLocaleString("sl-SI", {
      maximumFractionDigits: 2,
    });

    return isMonetary ? `${formatted} €` : formatted;
  };
  
  const calculatePercentage = (): number => {
    if (!data.value || !stats || stats.min === null || stats.max === null) return 0;
    
    const min = stats.min;
    const max = stats.max;
    
    if (max === min) return 50; // Avoid division by zero
    
    return ((data.value - min) / (max - min)) * 100;
  };

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!data.value || !stats || stats.min === null || stats.max === null) {
      setPercentage(0);
      return;
    }
    const min = stats.min;
    const max = stats.max;
    if (max === min) {
      setPercentage(50);
      return;
    }
    setPercentage(((data.value - min) / (max - min)) * 100);
  }, [data.value, stats]);

  return (
    <>
      {/* Explanation Modal */}
      {showExplanation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]"
          onClick={() => setShowExplanation(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">{currentExplanation.title}</h3>
            <p className="text-neutral-700 mb-4">{currentExplanation.description}</p>
            <div className="flex justify-end">
              <Button 
                variant="default"
                onClick={() => setShowExplanation(false)}
              >
                Zapri
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Component */}
      <div className="absolute right-6 bottom-6 w-80 bg-white rounded-lg shadow-lg border border-neutral-light overflow-hidden" style={{ zIndex: 1000 }}>
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
              <div className="flex items-center gap-1">
                <span className="text-sm text-neutral-dark">{parameterName} ({year})</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-0 w-4 h-4 text-neutral-dark hover:bg-transparent"
                  onClick={() => setShowExplanation(true)}
                >
                  <Info className="w-3 h-3" />
                </Button>
              </div>
              <span className="font-semibold">{formatNumber(data.value)}</span>
            </div>
            
            <div className="h-2 w-full bg-neutral-lighter rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${calculatePercentage()}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-neutral-dark mt-1">
              <span>{formatNumber(stats?.min)}</span>
              <span>{formatNumber(stats?.max)}</span>
            </div>



              <div className="bg-neutral-lighter px-4 py-3 flex justify-between">
                <Button variant="ghost" size="sm" className="text-sm text-neutral-dark hover:text-primary flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Prikaži zgodovino
                </Button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
