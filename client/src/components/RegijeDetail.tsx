import { Button } from "@/components/ui/button";
import { X, Eye, ChevronRight, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface RegionDetailProps {
  imeregije: string;
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

export default function RegijeDetail({
  imeregije,
  data,
  parameterName,
  year,
  stats,
  onClose
}: RegionDetailProps) {
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


  
  
    const [history, setHistory] = useState<{ year: number; value: number | null }[]>([]);
    const [showHistory, setShowHistory] = useState(false);
  
  
  
  
  
  // Simple translation function
  function translateToEnglish(slovenianParam: string): string {
    const translations: Record<string, string> = {
      "Bruto dohodek - SKUPAJ": "Gross income - TOTAL",
      "Dohodek iz dela": "Income from work",
      "Starševski, družinski in socialni prejemki": "Parental, family and social benefits",
      "Pokojnine": "Pensions",
      "Dohodek iz premoženja, kapitala in drugi": "Property, capital and other income",
      "Izobrazba - SKUPAJ": "Education - TOTAL",
      "Terciarna izobrazba": "Tertiary",
      "Srednješolska izobrazba": "Upper secondary",
      "Osnovnošolska ali manj": "Basic or less",
      "Indeks delovne migracije": "Labour migration index",
      "Indeks delovne migracije - moški": "Labour migration index - men",
      "Indeks delovne migracije - ženske": "Labour migration index - women",
      "Delovno aktivni v občini prebivališča": "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence",
      "Delovno aktivni v občini prebivališča - moški": "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence - men",
      "Delovno aktivni v občini prebivališča - ženske": "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence - women"
    };
    
    return translations[slovenianParam] || slovenianParam;
  }
  
  
  const fetchHistory = async () => {
    try {
      setShowHistory(true); // Show loading state or history section
      const englishParam = translateToEnglish(parameterName);
      // Encode the municipality and parameter names for URL
      const encodedMunicipality = encodeURIComponent(imeregije);
      const encodedParameter = encodeURIComponent(englishParam);
      
      const response = await fetch(
        `http://localhost:5000/api/regions/${encodedMunicipality}/parameters/${encodedParameter}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // The API returns { municipality, parameter, data, totalRecords }
      // where data is an array of { year: number; value: number | null }[]
      console.log('History fetched:', result.data);
      setHistory(result.data || []);
      setShowHistoryPopup(true); // Show the popup after data is loaded
    } catch (error) {
      console.error('Error fetching history:', error);
      // You might want to show an error message to the user
      setHistory([]);
    }
  };
  
    const [showExplanation, setShowExplanation] = useState(false);
    const [showHistoryPopup, setShowHistoryPopup] = useState(false);


    
  const currentExplanation = getParameterExplanation(parameterName);

  const formatNumber = (value: number | null): string => {
    if (value == null) return "-";

    const formatted = value.toLocaleString("sl-SI", {
      maximumFractionDigits: 2,
    });

    return isMonetary ? `${formatted} €` : formatted;
  };
  // Calculate year-over-year change
  const calculateChange = (currentValue: number | null, previousValue: number | null): { 
    absolute: number | null, 
    percentage: number | null 
  } => {
    if (currentValue === null || previousValue === null || previousValue === 0) {
      return { absolute: null, percentage: null };
    }
    
    const absolute = currentValue - previousValue;
    const percentage = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    
    return { absolute, percentage };
  };

  // Format change with + or - prefix
  const formatChange = (change: { absolute: number | null, percentage: number | null }): string => {
    if (change.absolute === null || change.percentage === null) return "-";
    
    const sign = change.absolute >= 0 ? "+" : "";
    const absFormatted = formatNumber(Math.abs(change.absolute));
    const percFormatted = Math.abs(change.percentage).toLocaleString("sl-SI", { maximumFractionDigits: 1 });
    
    return `${sign}${absFormatted} (${sign}${percFormatted}%)`;
  };

  // Get change color class
  const getChangeColor = (change: { absolute: number | null, percentage: number | null }): string => {
    if (change.absolute === null) return "text-neutral-dark";
    if (change.absolute > 0) return "text-green-600";
    if (change.absolute < 0) return "text-red-600";
    return "text-neutral-dark";
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

  // Prepare history data with changes
  const historyWithChanges = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // Sort by year descending
    const sortedHistory = [...history].sort((a, b) => b.year - a.year);
    
    return sortedHistory.map((item, index) => {
      const previousItem = sortedHistory[index + 1];
      const change = calculateChange(item.value, previousItem?.value || null);
      
      return {
        ...item,
        change,
        isLatest: index === 0
      };
    });
  }, [history]);


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

    {/* History Table Popup */}
    {showHistoryPopup && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1002]"
        onClick={() => setShowHistoryPopup(false)}
      >
        <div 
          className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-neutral-light">
            <div>
              <h3 className="text-xl font-semibold text-neutral-darkest">
                Zgodovina podatkov
              </h3>
              <p className="text-sm text-neutral-dark mt-1">
                {imeregije} - {parameterName}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2 rounded-full hover:bg-neutral-lighter"
              onClick={() => setShowHistoryPopup(false)}
            >
              <X className="w-5 h-5 text-neutral-dark" />
            </Button>
          </div>

                {/* Table */}
          <div className="max-h-[60vh] overflow-y-auto">
            {historyWithChanges.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-dark">
                Ni podatkov za prikaz
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-lighter sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium text-neutral-darkest">Leto</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-darkest">Vrednost</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-darkest">Sprememba</th>
                  </tr>
                </thead>
                <tbody>
                  {historyWithChanges.map((item) => (
                    <tr
                      key={item.year}
                      className={`border-b border-neutral-light hover:bg-neutral-lighter/50 ${item.isLatest ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-darkest">
                            {item.year}
                          </span>
                          {item.isLatest && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                              najnovejši
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-neutral-darkest">
                        {formatNumber(item.value)}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-medium ${getChangeColor(item.change)}`}>
                            {formatChange(item.change)}
                          </span>
                          {item.change.absolute !== null && (
                            <div className="flex items-center mt-0.5">
                              {item.change.absolute > 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                              ) : item.change.absolute < 0 ? (
                                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                              ) : (
                                <Minus className="w-3 h-3 text-neutral-dark mr-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>



          {/* Footer */}
          <div className="p-6 border-t border-neutral-light bg-neutral-lighter/30">
            <div className="flex justify-between items-center text-sm text-neutral-dark">
              <span>Skupaj {historyWithChanges.length} zapisov</span>
              <Button 
                variant="default"
                onClick={() => setShowHistoryPopup(false)}
              >
                Zapri
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Main Component */}
    <div className="absolute right-6 bottom-6 w-80 bg-white rounded-lg shadow-lg border border-neutral-light overflow-hidden" style={{ zIndex: 1000 }}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-neutral-darkest">{imeregije}</h3>
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
        </div>
      </div>

      <div className="bg-neutral-lighter px-4 py-3 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm text-neutral-dark hover:text-primary flex items-center"
          onClick={fetchHistory}
        >
          <Eye className="w-4 h-4 mr-1" />
          Prikaži zgodovino
        </Button>
      </div>
    </div>
  </>
);
  
}
