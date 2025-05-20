import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dataQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data on server start
  await storage.initializeData();
  
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

  const httpServer = createServer(app);
  return httpServer;
}
