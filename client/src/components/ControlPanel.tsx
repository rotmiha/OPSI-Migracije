import { ParameterGroup } from "@shared/schema";
import ParameterSelector from "./ParameterSelector";
import YearSelector from "./YearSelector";
import ColorLegend from "./ColorLegend";
import DataSummary from "./DataSummary";
import { Loader2 } from "lucide-react";
import { Info, Download } from "lucide-react";

interface ControlPanelProps {
  parameterGroups: ParameterGroup[];
  availableYears: number[];
  selectedGroupId: string;
  selectedParameter: string;
  selectedParameterName: string;
  selectedYear: number | null;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  } | undefined;
  onGroupChange: (groupId: string) => void;
  onParameterChange: (parameterId: string, parameterName: string) => void;
  onYearChange: (year: number) => void;
  isLoading: boolean;
}

export default function ControlPanel({
  parameterGroups,
  availableYears,
  selectedGroupId,
  selectedParameter,
  selectedParameterName,
  selectedYear,
  stats,
  onGroupChange,
  onParameterChange,
  onYearChange,
  isLoading
}: ControlPanelProps) {
  return (
    <div className="md:w-80 lg:w-96 border-r border-neutral-light bg-white p-4 flex flex-col h-full overflow-hidden">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-darkest">Zemljevid Slovenije</h1>
        <p className="text-neutral-dark text-sm mt-1">Interaktivni prikaz podatkov po občinah</p>
      </div>

      {/* Controls Area with scrollable content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
        {/* Parameter Selector */}
        <ParameterSelector 
          parameterGroups={parameterGroups}
          selectedGroupId={selectedGroupId}
          selectedParameterId={selectedParameter}
          onGroupChange={onGroupChange}
          onParameterChange={onParameterChange}
        />
        
        {/* Year Selector */}
        <YearSelector 
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
        
        {/* Color Legend */}
        {stats && selectedYear && (
          <ColorLegend 
            min={stats.min}
            max={stats.max}
            parameterName={selectedParameterName}
            year={selectedYear}
          />
        )}
        
        {/* Data Summary */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          stats && <DataSummary stats={stats} />
        )}
      </div>
      

    </div>
  );
}
