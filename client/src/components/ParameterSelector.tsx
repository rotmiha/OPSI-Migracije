import { ParameterGroup } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ParameterSelectorProps {
  parameterGroups: ParameterGroup[];
  selectedGroupId: string;
  selectedParameterId: string;
  onGroupChange: (groupId: string) => void;
  onParameterChange: (parameterId: string, parameterName: string) => void;
}

export default function ParameterSelector({ 
  parameterGroups, 
  selectedGroupId, 
  selectedParameterId,
  onGroupChange,
  onParameterChange
}: ParameterSelectorProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState("demografija");
  
  // Filter parameter groups for the selected category
  const filteredGroups = parameterGroups;
  
  // Find the selected group
  const selectedGroup = parameterGroups.find(group => group.id === selectedGroupId);
  
  // Handle parameter change
  const handleParameterSelect = (parameterId: string) => {
    const group = parameterGroups.find(group => 
      group.parameters.some(param => param.field === parameterId)
    );
    
    if (group) {
      const parameter = group.parameters.find(param => param.field === parameterId);
      if (parameter) {
        onParameterChange(parameterId, parameter.name);
      }
    }
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Izbira parametra</h2>
      
      {/* Category Tabs */}
      <div className="mb-4">
        <div className="flex border-b border-neutral-light">
          <Button 
            variant="ghost" 
            className={`px-4 py-2 border-b-2 ${activeCategoryTab === 'demografija' ? 'border-primary text-primary' : 'border-transparent text-neutral-dark hover:text-primary'}`}
            onClick={() => setActiveCategoryTab('demografija')}
          >
            Demografija
          </Button>
          <Button 
            variant="ghost" 
            className={`px-4 py-2 border-b-2 ${activeCategoryTab === 'ekonomija' ? 'border-primary text-primary' : 'border-transparent text-neutral-dark hover:text-primary'}`}
            onClick={() => setActiveCategoryTab('ekonomija')}
          >
            Ekonomija
          </Button>
          <Button 
            variant="ghost" 
            className={`px-4 py-2 border-b-2 ${activeCategoryTab === 'izobrazevanje' ? 'border-primary text-primary' : 'border-transparent text-neutral-dark hover:text-primary'}`}
            onClick={() => setActiveCategoryTab('izobrazevanje')}
          >
            Izobraževanje
          </Button>
        </div>
      </div>
      
      {/* Parameter Selection */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="parameter-group" className="block text-sm font-medium text-neutral-dark mb-1">
            Skupina parametrov
          </Label>
          <Select 
            value={selectedGroupId} 
            onValueChange={(value) => onGroupChange(value)}
          >
            <SelectTrigger id="parameter-group" className="w-full">
              <SelectValue placeholder="Izberi skupino parametrov" />
            </SelectTrigger>
            <SelectContent>
              {filteredGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="specific-parameter" className="block text-sm font-medium text-neutral-dark mb-1">
            Parameter
          </Label>
          <Select 
            value={selectedParameterId} 
            onValueChange={(value) => handleParameterSelect(value)}
            disabled={!selectedGroup}
          >
            <SelectTrigger id="specific-parameter" className="w-full">
              <SelectValue placeholder="Izberi parameter" />
            </SelectTrigger>
            <SelectContent>
              {selectedGroup?.parameters.map((parameter) => (
                <SelectItem key={parameter.field} value={parameter.field}>
                  {parameter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
