import { MunicipalityData, MunicipalityRawData, ParameterGroup, ParameterYearsResponse, MunicipalityDataResponse, parameterGroups } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { parseCsvFile } from "./utils/csvParser";

export interface IStorage {
  initializeData(): Promise<void>;
  getParametersAndAvailableYears(): Promise<ParameterYearsResponse>;
  getMunicipalityData(parameter: string, year: number): Promise<MunicipalityDataResponse>;
}

export class MemStorage implements IStorage {
  private municipalityData: MunicipalityRawData[] = [];
  private availableYears: Record<string, number[]> = {};

  constructor() {}

  async initializeData(): Promise<void> {
    try {
      const csvFilePath = path.resolve(process.cwd(), 'attached_assets', 'prebivalstvo_zdruzeno.csv');
      const rawData = await parseCsvFile(csvFilePath);
      
      this.municipalityData = rawData;
      
      // Calculate available years for each parameter
      this.calculateAvailableYears();
      
      console.log(`Data initialized with ${this.municipalityData.length} records`);
    } catch (error) {
      console.error('Error initializing data:', error);
      throw new Error('Failed to initialize data');
    }
  }
  
  private calculateAvailableYears(): void {
    // Initialize the availableYears object with empty arrays for each parameter
    const allParameters = parameterGroups.flatMap(group => 
      group.parameters.map(param => param.field)
    );
    
    allParameters.forEach(param => {
      this.availableYears[param] = [];
    });
    
    // Populate available years for each parameter
    for (const row of this.municipalityData) {
      const year = Number(row.leto);
      
      for (const param of allParameters) {
        const value = row[param];
        // If value exists and is not 'z' (hidden)
        if (value !== undefined && value !== null && value !== '' && value !== 'z') {
          if (!this.availableYears[param].includes(year)) {
            this.availableYears[param].push(year);
          }
        }
      }
    }
    
    // Sort years in ascending order
    for (const param in this.availableYears) {
      this.availableYears[param].sort((a, b) => a - b);
    }
  }

  async getParametersAndAvailableYears(): Promise<ParameterYearsResponse> {
    return {
      parameterGroups,
      availableYears: this.availableYears
    };
  }

  async getMunicipalityData(parameter: string, year: number): Promise<MunicipalityDataResponse> {
    const data = this.municipalityData
      .filter(row => Number(row.leto) === year)
      .map(row => {
        const value = row[parameter];
        let numValue: number | null = null;
        
        if (value !== undefined && value !== null && value !== '' && value !== 'z') {
          numValue = Number(value);
        }
        
        return {
          municipality: row.obcina as string,
          value: numValue
        };
      });
    
    // Calculate statistics
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
}

export const storage = new MemStorage();
