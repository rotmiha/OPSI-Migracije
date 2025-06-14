import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ControlPanel from "@/components/ControlPanel";
import Map from "@/components/Map";
import DataVisualization from "@/components/DataVisualization";
import YearSelector from "@/components/YearSelector";
import { ParameterGroup } from "@shared/schema";
import { Loader2, LucideFileChartColumnIncreasing } from "lucide-react";
import Popup from "@/components/PopupViri";
import { set } from "date-fns";
import PopupPomoc from "@/components/PopupPomoc";
import { truncateByDomain } from "recharts/types/util/ChartUtils";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export default function Home() {
  // All state declarations first
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedParameterName, setSelectedParameterName] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(2023);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState<boolean>(true);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(8);
  const [open, setOpen] = useState(false); 
  const [openraz, setOpenraz] = useState(false); 

  const [isDataVizPopupOpen, setIsDataVizPopupOpen] = useState(false);
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

      function getClosestYearBefore(years: number[], targetYear: number): number | null {
          // Filter years strictly less than targetYear
          const possibleYears = years.filter(y => y < targetYear);
          if (possibleYears.length > 0) {
            // Return the closest (max of filtered)
            return Math.max(...possibleYears);
          } else {
            // fallback to smallest year or null if empty
            return years.length > 0 ? Math.min(...years) : null;
          }
        }

      useEffect(() => {
          if (parametersData?.availableYears && selectedParameter) {
            const years = parametersData.availableYears[selectedParameter] || [];
            setAvailableYears(years);

            if (years.length > 0) {
              const targetYear = 2025; // fixed target year
              const closestYear = getClosestYearBefore(years, targetYear);
              setSelectedYear(closestYear);
            } else {
              setSelectedYear(null);
            }
          }
        }, [selectedParameter, parametersData]);

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

    if(year == 2025 || year == 2026 || year == 2027) {
      console.log("Izbrano leto niso realna");
    }
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
  <div className="h-screen flex flex-col">
    {/* Header */}
    <div className="bg-white border-b border-neutral-light p-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-neutral-darkest">
        
        {selectedYear > 2024 && "Napovedujemo: "}
        {selectedParameterName || ""}
        {selectedYear && ` (${selectedYear})`}
      </h1>

      {[2025, 2026, 2027].includes(selectedYear ?? 0) && (
        <span className="text-xl text-red-600 font-bold">
          Podatki za to leto so napovedani na podlagi našega napovednega modela.
        </span>
      )}

      <div className="flex gap-2">
        <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="px-3 py-2 bg-primary text-white rounded text-sm">
          {isSidebarVisible ? '←' : '→'}
        </button>
        <button onClick={() => setIsBottomPanelVisible(!isBottomPanelVisible)} className="px-3 py-2 text-white rounded text-sm" style={{ backgroundColor: isBottomPanelVisible ? '#4A90E2' : '#7F8C8D' }}>
          {isBottomPanelVisible ? '↓' : '↑'}
        </button>
      </div>
    </div>

    {/* Main content: sidebar + map */}
    <div className="flex flex-grow overflow-hidden">
      {/* Sidebar */}
      {isSidebarVisible && (
         <div className="w-full md:w-80 lg:w-96 h-screen overflow-hidden border-r border-neutral-light bg-white">
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
            open={open}
            setOpen={setOpen}
            openraz={openraz}
            setOpenraz={setOpenraz}
            setIsDataVizPopupOpen={setIsDataVizPopupOpen}
          />
        </div>
      )}

      {/* Map + bottom panel */}
      <div className="flex flex-col flex-grow">
        <div className="flex-grow">
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

        {/* Bottom panel (fixed height) */}
        {isBottomPanelVisible && (
        <div className="bg-white border-t border-neutral-light flex-shrink-0">
          <div className="p-4">
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
            />
          </div>
        </div>
      )}

      </div>
    </div>

    {/* Modals */}
    {open && (
      <>
        <div className="fixed inset-0 bg-black/30 z-[9998]" />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <Popup jeOdprt={open} onZapri={() => setOpen(false)} />
          </div>
        </div>
      </>
    )}

    {openraz && (
      <>
        <div className="fixed inset-0 bg-black/30 z-[9998]" />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <PopupPomoc jeOdprt={openraz} onZapri={() => setOpenraz(false)} />
          </div>
        </div>
      </>
    )}

    {/* Data Visualization */}
    {isDataVizPopupOpen && geoData && !isLoadingData && (
      <>
        <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsDataVizPopupOpen(false)} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={() => setIsDataVizPopupOpen(false)} aria-label="Close popup">
              ✕
            </button>
            <DataVisualization
              data={geoData.data}
              parameterName={selectedParameterName}
              year={selectedYear}
              stats={geoData.stats}
            />
          </div>
        </div>
      </>
    )}
  </div>
);


}
