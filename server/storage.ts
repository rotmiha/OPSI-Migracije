import { MunicipalityData, MunicipalityRawData, ParameterGroup, ParameterYearsResponse, MunicipalityDataResponse, parameterGroups } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { parseCsvFile } from "./utils/csvParser";

export interface IStorage {
  initializeData(): Promise<void>;
  getParametersAndAvailableYears(): Promise<ParameterYearsResponse>;
  getMunicipalityData(parameter: string, year: number): Promise<MunicipalityDataResponse>;
  getAllMunicipalities(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private municipalityData: MunicipalityRawData[] = [];
  private availableYears: Record<string, number[]> = {};
  private municipalities: string[] = [];

  constructor() {}

  async initializeData(): Promise<void> {
    try {
      const csvFilePath = path.resolve(process.cwd(), 'attached_assets', 'Obcine_z_napovedjo.csv');
      const rawData = await parseCsvFile(csvFilePath);
      
      this.municipalityData = rawData;
      
      // Calculate available years for each parameter
      this.calculateAvailableYears();
      
      // Extract unique municipalities
      this.extractMunicipalities();
      
      console.log(`Data initialized with ${this.municipalityData.length} records`);
      console.log(`Found ${this.municipalities.length} unique municipalities`);
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

  private extractMunicipalities(): void {
    const municipalitySet = new Set<string>();
    
    for (const row of this.municipalityData) {
      if (typeof row.obcina === 'string' && row.obcina.trim() !== '') {
        municipalitySet.add(row.obcina.trim());
      }
    }
    
    this.municipalities = Array.from(municipalitySet).sort();
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

  /**
   * Gets all unique municipalities from the data
   */
  async getAllMunicipalities(): Promise<string[]> {
    return [...this.municipalities]; // Return a copy to prevent external modification
  }

  /**
   * Gets all available years for a specific parameter
   */
  async getAvailableYearsForParameter(parameter: string): Promise<number[]> {
    return this.availableYears[parameter] || [];
  }

  /**
   * Gets parameter data for a specific municipality across all available years
   */
  async getParameterDataForMunicipality(
    municipality: string,
    parameter: string
  ): Promise<{ year: number; value: number | null }[]> {
    if (!this.availableYears[parameter]) {
      return [];
    }

    const results: { year: number; value: number | null }[] = [];

    for (const year of this.availableYears[parameter]) {
      const yearData = this.municipalityData.find(
        row => Number(row.leto) === year && row.obcina === municipality
      );

      if (yearData) {
        const value = yearData[parameter];
        let numValue: number | null = null;
        
        if (value !== undefined && value !== null && value !== '' && value !== 'z') {
          numValue = Number(value);
        }

        results.push({
          year,
          value: numValue
        });
      }
    }

    return results;
  }

  /**
   * Gets all parameters data for a specific municipality across all years
   */
  async getAllParametersDataForMunicipality(
    municipality: string
  ): Promise<Record<string, { year: number; value: number | null }[]>> {
    const allParameters = parameterGroups.flatMap(group => 
      group.parameters.map(param => param.field)
    );

    const results: Record<string, { year: number; value: number | null }[]> = {};

    for (const param of allParameters) {
      results[param] = await this.getParameterDataForMunicipality(municipality, param);
    }

    return results;
  }

  /**
   * Finds a municipality by name with flexible matching
   * Useful for handling case differences and slight variations
   */
  async findMunicipalityByName(searchName: string): Promise<string | null> {
    const normalizedSearch = searchName.toLowerCase().trim();
    
    // First try exact match (case insensitive)
    const exactMatch = this.municipalities.find(mun => 
      mun.toLowerCase() === normalizedSearch
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Try partial matching
    const partialMatch = this.municipalities.find(mun => {
      const normalizedMun = mun.toLowerCase();
      const searchWords = normalizedSearch.split(/\s+/);
      const munWords = normalizedMun.split(/\s+/);
      
      // Check if all search words are present in municipality name
      return searchWords.every(searchWord => 
        munWords.some(munWord => 
          munWord.includes(searchWord) || searchWord.includes(munWord)
        )
      );
    });
    
    return partialMatch || null;
  }
}

export const storage = new MemStorage();