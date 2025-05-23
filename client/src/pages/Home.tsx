import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ControlPanel from "@/components/ControlPanel";
import Map from "@/components/Map";
import DataVisualization from "@/components/DataVisualization";
import YearSelector from "@/components/YearSelector";
import { ParameterGroup } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Home() {
  // State for selected parameter group, parameter, and year
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedParameterName, setSelectedParameterName] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

  // Fetch parameters and available years
  const { 
    data: parametersData, 
    isLoading: isLoadingParameters,
    isError: isErrorParameters 
  } = useQuery({
    queryKey: ['/api/parameters'],
  });

  // Fetch municipality data based on selected parameter and year
  const { 
    data: municipalityData, 
    isLoading: isLoadingData,
    isError: isErrorData
  } = useQuery({
    queryKey: ['/api/data', selectedParameter, selectedYear],
    queryFn: async ({ queryKey }) => {
      const [_, parameter, year] = queryKey;
      if (!parameter || !year) return null;
      
      const response = await fetch(`/api/data?parameter=${encodeURIComponent(parameter)}&year=${year}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
    enabled: !!selectedParameter && !!selectedYear,
  });

  // Set initial values when parameters data is loaded
  useEffect(() => {
    if (parametersData && parametersData.parameterGroups.length > 0) {
      const firstGroup = parametersData.parameterGroups[0];
      const firstParam = firstGroup.parameters[0];

      if (!selectedGroupId) setSelectedGroupId(firstGroup.id);
      if (!selectedParameter) {
        setSelectedParameter(firstParam.field);
        setSelectedParameterName(firstParam.name);

        // Set available years for the selected parameter
        const years = parametersData.availableYears[firstParam.field] || [];
        setAvailableYears(years);
        
        // Set the most recent year as the default
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[years.length - 1]);
        }
      }
    }
  }, [parametersData]);

  // Update available years when parameter changes
  useEffect(() => {
    if (parametersData && selectedParameter) {
      const years = parametersData.availableYears[selectedParameter] || [];
      setAvailableYears(years);
      
      // If current year is not available, set to most recent available year
      if (!years.includes(selectedYear as number)) {
        setSelectedYear(years.length > 0 ? years[years.length - 1] : null);
      }
    }
  }, [selectedParameter, parametersData]);

  // Handle parameter group change
  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  // Handle parameter change
  const handleParameterChange = (parameterId: string, parameterName: string) => {
    setSelectedParameter(parameterId);
    setSelectedParameterName(parameterName);
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // If loading parameters, show a loading indicator
  if (isLoadingParameters) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Nalaganje podatkov...</p>
        </div>
      </div>
    );
  }

  // If error fetching parameters, show an error message
  if (isErrorParameters) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Napaka pri nalaganju podatkov</h1>
          <p>Poskusite ponovno naložiti stran.</p>
        </div>
      </div>
    );
  }

  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState<boolean>(true);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'l' || event.key === 'L') {
        setIsSidebarVisible(!isSidebarVisible);
      }
      if (event.key === 'b' || event.key === 'B') {
        setIsBottomPanelVisible(!isBottomPanelVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSidebarVisible, isBottomPanelVisible]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with dynamic title */}
      <div className="bg-white border-b border-neutral-light p-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-semibold text-neutral-darkest">
          {selectedParameterName || ""}
          {selectedYear && ` (${selectedYear})`}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="px-3 py-2 bg-primary text-white rounded text-sm"
            title="Skrij/prikaži levi meni (tipka L)"
          >
            {isSidebarVisible ? '←' : '→'}
          </button>
          <button 
            onClick={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
            className="px-3 py-2 bg-secondary text-white rounded text-sm"
            title="Skrij/prikaži spodnji meni (tipka B)"
          >
            {isBottomPanelVisible ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Main content area with full page scrolling */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar with controls */}
        {isSidebarVisible && (
          <div className="w-full md:w-80 lg:w-96 border-r border-neutral-light bg-white md:sticky md:top-16 md:h-screen md:overflow-y-auto">
            <ControlPanel 
              parameterGroups={parametersData?.parameterGroups as ParameterGroup[]}
              availableYears={availableYears}
              selectedGroupId={selectedGroupId}
              selectedParameter={selectedParameter}
              selectedParameterName={selectedParameterName}
              selectedYear={selectedYear}
              stats={municipalityData?.stats}
              onGroupChange={handleGroupChange}
              onParameterChange={handleParameterChange}
              onYearChange={handleYearChange}
              isLoading={isLoadingData}
            />
          </div>
        )}

        <div className="flex-grow flex flex-col">
          {/* Enlarged map area */}
          <div className="h-screen md:h-[80vh] lg:h-[90vh]">
            <Map 
              data={municipalityData?.data || []}
              stats={municipalityData?.stats}
              selectedParameter={selectedParameterName}
              selectedParameterField={selectedParameter}
              selectedYear={selectedYear}
              isLoading={isLoadingData || isLoadingParameters}
              isError={isErrorData}
            />
          </div>
          
          {/* Year selector and data visualization */}
          {isBottomPanelVisible && (
            <div className="bg-white border-t border-neutral-light">
              {/* Year selector */}
              <div className="p-4 border-b border-neutral-light">
                <YearSelector 
                  availableYears={availableYears}
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                />
              </div>
              
              {/* Data visualization */}
              {municipalityData && !isLoadingData && (
                <div>
                  <DataVisualization 
                    data={municipalityData.data}
                    parameterName={selectedParameterName}
                    year={selectedYear}
                    stats={municipalityData.stats}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
