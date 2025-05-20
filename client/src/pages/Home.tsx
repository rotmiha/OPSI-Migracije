import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ControlPanel from "@/components/ControlPanel";
import Map from "@/components/Map";
import DataVisualization from "@/components/DataVisualization";
import { ParameterGroup } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Home() {
  // State for selected parameter group, parameter, and year
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedParameter, setSelectedParameter] = useState<string>("");
  const [selectedParameterName, setSelectedParameterName] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

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
    queryKey: ['/api/data', { parameter: selectedParameter, year: selectedYear }],
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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
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
        <div className="flex-grow flex flex-col overflow-hidden">
          <Map 
            data={municipalityData?.data || []}
            stats={municipalityData?.stats}
            selectedParameter={selectedParameterName}
            selectedYear={selectedYear}
            isLoading={isLoadingData || isLoadingParameters}
            isError={isErrorData}
          />
          
          {/* Data visualization outside of map */}
          {municipalityData && !isLoadingData && (
            <div className="h-80 overflow-y-auto border-t border-neutral-light">
              <DataVisualization 
                data={municipalityData.data}
                parameterName={selectedParameterName}
                year={selectedYear}
                stats={municipalityData.stats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
