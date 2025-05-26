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
}

export class MemStorageReg implements IStorageReg {
  private regionData: RegionRawData[] = [];
  private availableYears: Record<string, number[]> = {};

  constructor() {}

  async initializeData(): Promise<void> {
    try {
      const csvFilePath = path.resolve(process.cwd(), 'attached_assets', 'podatkiRegije_zdruzeno.csv');
      const rawData = await parseCsvFile(csvFilePath);

      this.regionData = rawData;
      this.calculateAvailableYears();

      console.log(`Region data initialized with ${this.regionData.length} records`);
    } catch (error) {
      console.error('Error initializing region data:', error);
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
}

export const storageReg = new MemStorageReg();
