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
  // Get all parameters from all groups for single selection
  const allParameters = parameterGroups.flatMap(group => 
    group.parameters.map(param => ({
      ...param,
      groupName: group.name
    }))
  );
  
  // Handle parameter change
  const handleParameterSelect = (parameterId: string) => {
    const parameter = allParameters.find(param => param.field === parameterId);
    if (parameter) {
      onParameterChange(parameterId, parameter.name);
    }
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-neutral-darkest">Izbira parametra</h2>
      
      {/* Single Parameter Selection */}
      <div>
        <Label htmlFor="parameter-select" className="block text-sm font-medium text-neutral-dark mb-1">
          Parameter
        </Label>
        <Select 
          value={selectedParameterId} 
          onValueChange={(value) => handleParameterSelect(value)}
        >
          <SelectTrigger id="parameter-select" className="w-full">
            <SelectValue placeholder="Izberi parameter za prikaz" />
          </SelectTrigger>
          <SelectContent>
            {parameterGroups.map((group) => (
              <div key={group.id}>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-100">
                  {group.name}
                </div>
                {group.parameters.map((parameter) => (
                  <SelectItem key={parameter.field} value={parameter.field}>
                    {parameter.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
