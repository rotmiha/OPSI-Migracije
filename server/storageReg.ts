import {
  RegionData,
  RegionRawData,
  ParameterGroup,
  ParameterYearsResponse,
  RegionDataResponse,
  parameterGroupsReg
} from "@shared/schemaReg";
import fs from 'fs';
import path from 'path';
import { parseCsvFile } from "./utils/csvParser";

export interface IStorageReg {
  initializeData(): Promise<void>;
  getParametersAndAvailableYears(): Promise<ParameterYearsResponse>;
  getRegionData(parameter: string, year: number): Promise<RegionDataResponse>;
  getAllRegions(): Promise<string[]>;
}

export class MemStorageReg implements IStorageReg {
  private regionData: RegionRawData[] = [];
  private availableYears: Record<string, number[]> = {};
  private regions: string[] = [];

  constructor() {}

  async initializeData(): Promise<void> {
    try {
      const csvFilePath = path.resolve(process.cwd(), 'attached_assets', 'Regije_z_napovedjo.csv');
      const rawData = await parseCsvFile(csvFilePath);

      this.regionData = rawData;
      this.calculateAvailableYears();
      this.extractRegions();

    } catch (error) {
      throw new Error('Failed to initialize region data');
    }
  }

  private calculateAvailableYears(): void {
    const allParameters = parameterGroupsReg.flatMap(group =>
      group.parameters.map(param => param.field)
    );

    allParameters.forEach(param => {
      this.availableYears[param] = [];
    });

    for (const row of this.regionData) {
      const year = Number(row.leto);

      for (const param of allParameters) {
        const value = row[param];
        if (value !== undefined && value !== null && value !== '' && value !== 'z') {
          if (!this.availableYears[param].includes(year)) {
            this.availableYears[param].push(year);
          }
        }
      }
    }

    for (const param in this.availableYears) {
      this.availableYears[param].sort((a, b) => a - b);
    }
  }

  private extractRegions(): void {
    const regionSet = new Set<string>();
    for (const row of this.regionData) {
      if (typeof row.regija === 'string' && row.regija.trim() !== '') {
        regionSet.add(row.regija.trim());
      }
    }
    this.regions = Array.from(regionSet).sort();
  }

  async getParametersAndAvailableYears(): Promise<ParameterYearsResponse> {
    return {
      parameterGroups: parameterGroupsReg,
      availableYears: this.availableYears
    };
  }

  async getRegionData(parameter: string, year: number): Promise<RegionDataResponse> {
    const data = this.regionData
      .filter(row => Number(row.leto) === year)
      .map(row => {
        const value = row[parameter];
        let numValue: number | null = null;

        if (value !== undefined && value !== null && value !== '' && value !== 'z') {
          numValue = Number(value);
        }

        return {
          region: row.regija as string,
          value: numValue
        };
      });

    const validValues = data
      .map(item => item.value)
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);

    const min = validValues.length > 0 ? validValues[0] : null;
    const max = validValues.length > 0 ? validValues[validValues.length - 1] : null;
    const avg = validValues.length > 0
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      : null;
    const middle = Math.floor(validValues.length / 2);
    const median = validValues.length > 0
      ? validValues.length % 2 === 0
        ? (validValues[middle - 1] + validValues[middle]) / 2
        : validValues[middle]
      : null;

    return {
      data,
      stats: {
        min,
        max,
        avg,
        median
      }
    };
  }

  async getAllRegions(): Promise<string[]> {
    return [...this.regions];
  }

  async getAvailableYearsForParameter(parameter: string): Promise<number[]> {
    return this.availableYears[parameter] || [];
  }

    // Helper method to find parameter by name (case insensitive)
private findParameterByName(searchParam: string): string | null {
  const available = Object.keys(this.availableYears);
  
  // First try exact match (case insensitive)
  const exactMatch = available.find(p => 
    p.toLowerCase() === searchParam.toLowerCase()
  );
  if (exactMatch) return exactMatch;
  
  // Then try partial match
  const partialMatch = available.find(p => 
    p.toLowerCase().includes(searchParam.toLowerCase()) ||
    searchParam.toLowerCase().includes(p.toLowerCase())
  );
  
  return partialMatch || null;
}

async getParameterDataForRegion(region: string, parameter: string): Promise<{ year: number; value: number | null }[]> {
  // Find the actual parameter name
  const actualParameter = this.findParameterByName(parameter);
  
  
  
  if (!actualParameter) {
   
    return [];
  }
  
 
  const results: { year: number; value: number | null }[] = [];

  for (const year of this.availableYears[actualParameter]) {
     
    const yearData = this.regionData.find(
      row => Number(row.leto) === year && row.regija === region
    );

    
    let numValue: number | null = null;
    if (yearData) {
      const value = yearData[actualParameter];
      
      if (value !== undefined && value !== null && value !== '' && value !== 'z') {
        numValue = Number(value);
        
      }
    }

    results.push({ year, value: numValue });
  }

  return results;
}

// Also add this method to see what parameters are actually available
async getAvailableParameters(): Promise<string[]> {
  return Object.keys(this.availableYears);
}

// And this to see a sample of your raw data
async getSampleData(limit: number = 3): Promise<any[]> {
  return this.regionData.slice(0, limit);
}

  async getAllParametersDataForRegion(region: string): Promise<Record<string, { year: number; value: number | null }[]>> {
    const allParameters = parameterGroupsReg.flatMap(group =>
      group.parameters.map(param => param.field)
    );

    const results: Record<string, { year: number; value: number | null }[]> = {};

    for (const param of allParameters) {
      results[param] = await this.getParameterDataForRegion(region, param);
    }

    return results;
  }

    async findRegionByName(searchName: string): Promise<string | null> {
      const normalizedSearch = searchName.toLowerCase().trim();
      


      // First try exact match (case insensitive)
      const exactMatch = this.regions.find(reg =>
        reg.toLowerCase() === normalizedSearch
      );
      if (exactMatch) return exactMatch;
      
      // Then try partial match with better logic
      const partialMatch = this.regions.find(reg => {
        const normalizedReg = reg.toLowerCase();
        
        // Check if the search term is contained in the region name
        if (normalizedReg.includes(normalizedSearch)) return true;
        
        // Check if region name is contained in search term  
        if (normalizedSearch.includes(normalizedReg)) return true;
        
        // Word-based matching (your original logic)
        const searchWords = normalizedSearch.split(/\s+/);
        const regWords = normalizedReg.split(/\s+/);
        
        return searchWords.every(word =>
          regWords.some(rw => rw.includes(word) || word.includes(rw))
        );
      });
      
      return partialMatch || null;
    }

    // Alternative: Add a debug method to see what regions are available
    async getAllRegionsDebug(): Promise<string[]> {
      return this.regions;
    }
}

export const storageReg = new MemStorageReg();
