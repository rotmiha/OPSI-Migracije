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
