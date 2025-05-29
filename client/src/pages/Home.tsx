import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ControlPanel from "@/components/ControlPanel";
import Map from "@/components/Map";
import DataVisualization from "@/components/DataVisualization";
import YearSelector from "@/components/YearSelector";
import { ParameterGroup } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Home() {
  // All state declarations first
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedParameterName, setSelectedParameterName] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState<boolean>(true);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(8);

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
  data: geoData,
  isLoading: isLoadingData,
  isError: isErrorData,
} = useQuery({
  queryKey: ['/api/data', selectedParameter, selectedYear, currentZoomLevel],
  queryFn: async ({ queryKey }) => {
    const [_, parameter, year, zoom] = queryKey;
    if (!parameter || !year) return null;

    const url = zoom >= 9
      ? `/api/data?parameter=${encodeURIComponent(parameter)}&year=${year}`
      : `/api/data/regions?parameter=${encodeURIComponent(parameter)}&year=${year}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    return response.json();
  },
  enabled: !!selectedParameter && !!selectedYear,
});


  // Set initial values when parameters data is loaded
  useEffect(() => {
    if (parametersData?.parameterGroups && parametersData.parameterGroups.length > 0) {
      const firstGroup = parametersData.parameterGroups[0];
      if (!selectedGroupId) {
        setSelectedGroupId(firstGroup.id);
        if (firstGroup.parameters && firstGroup.parameters.length > 0) {
          const firstParam = firstGroup.parameters[0];
          setSelectedParameter(firstParam.field);
          setSelectedParameterName(firstParam.name);
        }
      }
    }
  }, [parametersData, selectedGroupId]);

  // Update available years when parameter group changes
  useEffect(() => {
    if (parametersData?.availableYears && selectedParameter) {
      const years = parametersData.availableYears[selectedParameter] || [];
      setAvailableYears(years);
      
      // Set the latest year as default if no year is selected
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(Math.max(...years));
      }
    }
  }, [selectedParameter, parametersData, selectedYear]);

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

  // Handler functions
  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    
    const group = parametersData?.parameterGroups?.find((g: ParameterGroup) => g.id === groupId);
    if (group && group.parameters && group.parameters.length > 0) {
      const firstParam = group.parameters[0];
      setSelectedParameter(firstParam.field);
      setSelectedParameterName(firstParam.name);
      setSelectedYear(null);
    }
  };

  const handleParameterChange = (parameterId: string, parameterName: string) => {
    setSelectedParameter(parameterId);
    setSelectedParameterName(parameterName);
    setSelectedYear(null);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Loading state
  if (isLoadingParameters) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-neutral-dark">Nalagam parametre...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorParameters) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Napaka pri nalaganju parametrov</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Poskusi znova
          </button>
        </div>
      </div>
    );
  }

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
            className="px-3 py-2 text-white rounded text-sm"
            title="Skrij/prikaži spodnji meni (tipka B)"
            style={{ backgroundColor: isBottomPanelVisible ? '#4A90E2' : '#7F8C8D' }}
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
              stats={geoData?.stats}
              onGroupChange={handleGroupChange}
              onParameterChange={handleParameterChange}
              onYearChange={handleYearChange}
              isLoading={isLoadingData}
            />
          </div>
        )}

        <div className="flex-grow flex flex-col">
          {/* Enlarged map area */}
          <div className="h-screen md:h-[60vh] lg:h-[70vh]">
            <Map 
              data={geoData?.data || []}
              stats={geoData?.stats}
              selectedParameter={selectedParameterName}
              selectedParameterField={selectedParameter}
              selectedYear={selectedYear}
              isLoading={isLoadingData || isLoadingParameters}
              isError={isErrorData}
              onZoomChange={setCurrentZoomLevel}
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
              {geoData && !isLoadingData && (
                <div>
                  <DataVisualization 
                    data={geoData.data}
                    parameterName={selectedParameterName}
                    year={selectedYear}
                    stats={geoData.stats}
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