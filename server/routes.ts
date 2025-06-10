import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { storageReg } from "./storageReg";
import { dataQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data on server start
  await storage.initializeData();
  await storageReg.initializeData();
  
  // API endpoint to get Slovenia GeoJSON data
  app.get('/api/geojson', async (_req: Request, res: Response) => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/stefanb/gurs-rpe/master/obcine.geojson');
      if (!response.ok) {
        throw new Error('Failed to fetch GeoJSON');
      }
      const geoJsonData = await response.json();
      res.json(geoJsonData);
    } catch (error) {
      console.error('Error fetching GeoJSON:', error);
      // Provide basic structure for testing
      const basicGeoJson = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": { "OB_ID": "1", "OB_UIME": "Ljubljana", "OB_SIFRA": "61" },
            "geometry": { "type": "Polygon", "coordinates": [[[14.5, 46.05], [14.55, 46.05], [14.55, 46.1], [14.5, 46.1], [14.5, 46.05]]] }
          },
          {
            "type": "Feature", 
            "properties": { "OB_ID": "2", "OB_UIME": "Maribor", "OB_SIFRA": "70" },
            "geometry": { "type": "Polygon", "coordinates": [[[15.6, 46.55], [15.7, 46.55], [15.7, 46.65], [15.6, 46.65], [15.6, 46.55]]] }
          },
          {
            "type": "Feature",
            "properties": { "OB_ID": "6", "OB_UIME": "ajdovščina", "OB_SIFRA": "1" },
            "geometry": { "type": "Polygon", "coordinates": [[[13.85, 45.85], [14.0, 45.85], [14.0, 46.0], [13.85, 46.0], [13.85, 45.85]]] }
          }
        ]
      };
      res.json(basicGeoJson);
    }
  });
  
  // API endpoint to get all parameter groups and available years
  app.get('/api/parameters', async (_req: Request, res: Response) => {
    try {
      const data = await storage.getParametersAndAvailableYears();
      res.json(data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      res.status(500).json({ message: 'Failed to fetch parameters' });
    }
  });
  

const municipalityParamSchema = z.object({
  municipality: z.string().min(1, 'Municipality name is required'),
  parameter: z.string().min(1, 'Parameter name is required')
});

// Helper function to normalize municipality names for comparison
const normalizeMunicipalityName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
};

// Helper function to find matching municipality in data
const findMatchingMunicipality = async (searchName: string, storage: any): Promise<string | null> => {
  const normalizedSearch = normalizeMunicipalityName(searchName);
  
  try {
    // Get all unique municipalities from the data
    const allMunicipalities = await storage.getAllMunicipalities();
    
    // First try exact match (normalized)
    const exactMatch = allMunicipalities.find((mun: string) => 
      normalizeMunicipalityName(mun) === normalizedSearch
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // If no exact match, try partial matching
    const partialMatch = allMunicipalities.find((mun: string) => {
      const normalizedMun = normalizeMunicipalityName(mun);
      const searchWords = normalizedSearch.split(' ');
      const munWords = normalizedMun.split(' ');
      
      // Check if all search words are present in municipality name
      return searchWords.every(searchWord => 
        munWords.some(munWord => 
          munWord.includes(searchWord) || searchWord.includes(munWord)
        )
      );
    });
    
    return partialMatch || null;
  } catch (error) {
    console.error('Error finding matching municipality:', error);
    return null;
  }
};

// API endpoint to get all years of data for a specific municipality and parameter
app.get('/api/municipalities/:municipality/parameters/:parameter', async (req: Request, res: Response) => {
  try {
    // Validate path parameters


    console.log('Received request for municipality parameter data');
    const paramResult = municipalityParamSchema.safeParse(req.params);
    
    if (!paramResult.success) {
      return res.status(400).json({ 
        message: 'Invalid path parameters',
        errors: paramResult.error.errors
      });
    }
    
    // Decode URL-encoded parameters
    const requestedMunicipality = decodeURIComponent(paramResult.data.municipality);
    const parameter = decodeURIComponent(paramResult.data.parameter);
    
    console.log('Requested municipality:', requestedMunicipality);
    console.log('Requested parameter:', parameter);
    
    // Find the actual municipality name in the data
    const actualMunicipality = await findMatchingMunicipality(requestedMunicipality, storage);
    
    if (!actualMunicipality) {
      return res.status(404).json({ 
        message: 'Municipality not found',
        requestedMunicipality,
        suggestion: 'Check the municipality name spelling and capitalization'
      });
    }
    
    console.log('Matched municipality:', actualMunicipality);
    
    // Get all data for this municipality and parameter across all years
    const data = await storage.getParameterDataForMunicipality(actualMunicipality, parameter);
    console.log('Data found:', data.length, 'records');
    
    // Return structured response with both requested and actual municipality names
    res.json({
      municipality: actualMunicipality, // Return the actual municipality name from data
      requestedMunicipality, // Also return what was requested for reference
      parameter,
      data,
      totalRecords: data.length
    });
  } catch (error) {
    console.error('Error fetching municipality parameter data:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid parameters',
        errors: error.errors
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch municipality parameter data' });
  }
});



    app.get('/api/regions/:region/parameters/:parameter', async (req: Request, res: Response) => {
      try {
        // Validate parameters
        
    console.log('Received request for municipality parameter data');
        const paramResult = municipalityParamSchema.safeParse({
          municipality: req.params.region,
          parameter: req.params.parameter
        });

        if (!paramResult.success) {
          return res.status(400).json({ 
            message: 'Invalid path parameters',
            errors: paramResult.error.errors
          });
        }

        const requestedRegion = decodeURIComponent(paramResult.data.municipality); // alias reuse
        const parameter = decodeURIComponent(paramResult.data.parameter);

        console.log('Requested region:', requestedRegion);
        console.log('Requested parameter:', parameter);

        // Find actual region name
        const actualRegion = await storageReg.findRegionByName(requestedRegion);

        if (!actualRegion) {
          return res.status(404).json({
            message: 'Region not found',
            requestedRegion,
            suggestion: 'Check the region name spelling and capitalization'
          });
        }

        console.log('Matched region:', actualRegion);

        // Get parameter data across all years
        const data = await storageReg.getParameterDataForRegion(actualRegion, parameter);

        res.json({
          region: actualRegion,
          requestedRegion,
          parameter,
          data,
          totalRecords: data.length
        });
      } catch (error) {
        console.error('Error fetching region parameter data:', error);

        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: 'Invalid parameters',
            errors: error.errors
          });
        }

        res.status(500).json({ message: 'Failed to fetch region parameter data' });
      }
    });




  // API endpoint to get municipality data for a specific parameter and year
  app.get('/api/data', async (req: Request, res: Response) => {
    try {
      const queryResult = dataQuerySchema.safeParse(req.query);
      
      if (!queryResult.success) {
        return res.status(400).json({ 
          message: 'Invalid query parameters',
          errors: queryResult.error.errors
        });
      }
      
      const { parameter, year } = queryResult.data;
      const data = await storage.getMunicipalityData(parameter, year);
      res.json(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid query parameters',
          errors: error.errors
        });
      }
      
      res.status(500).json({ message: 'Failed to fetch data' });
    }
  });

  // API endpoint to get region data for a specific parameter and year
  app.get('/api/data/regions', async (req: Request, res: Response) => {
    try {
      const queryResult = dataQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: queryResult.error.errors,
        });
      }

      const { parameter, year } = queryResult.data;
      const data = await storageReg.getRegionData(parameter, year);
      res.json(data);
    } catch (error) {
      console.error('Error fetching region data:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          errors: error.errors,
        });
      }

      res.status(500).json({ message: 'Failed to fetch region data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
