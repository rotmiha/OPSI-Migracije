// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { z } from "zod";
var municipalityData = pgTable("municipality_data", {
  id: serial("id").primaryKey(),
  municipality: text("municipality").notNull(),
  year: integer("year").notNull(),
  // Income data
  grossIncome: numeric("gross_income"),
  incomeFromWork: numeric("income_from_work"),
  parentalFamilySocialBenefits: numeric("parental_family_social_benefits"),
  pensions: numeric("pensions"),
  propertyCapitalOtherIncome: numeric("property_capital_other_income"),
  // Education data
  basicOrLess: integer("basic_or_less"),
  educationTotal: integer("education_total"),
  tertiary: integer("tertiary"),
  upperSecondary: integer("upper_secondary"),
  // Labor migration
  labourMigrationIndex: numeric("labour_migration_index"),
  labourMigrationIndexMen: numeric("labour_migration_index_men"),
  labourMigrationIndexWomen: numeric("labour_migration_index_women"),
  personsInEmploymentLocalRes: numeric("persons_in_employment_local_res"),
  personsInEmploymentLocalResMen: numeric("persons_in_employment_local_res_men"),
  personsInEmploymentLocalResWomen: numeric("persons_in_employment_local_res_women")
  // Other data can be added as needed
});
var parameterGroups = [
  {
    id: "income",
    name: "Prihodki",
    parameters: [
      { id: "grossIncome", name: "Bruto dohodek - SKUPAJ", field: "Gross income - TOTAL" },
      { id: "incomeFromWork", name: "Dohodek iz dela", field: "Income from work" },
      { id: "parentalFamilySocialBenefits", name: "Star\u0161evski, dru\u017Einski in socialni prejemki", field: "Parental, family and social benefits" },
      { id: "pensions", name: "Pokojnine", field: "Pensions" },
      { id: "propertyCapitalOtherIncome", name: "Dohodek iz premo\u017Eenja, kapitala in drugi", field: "Property, capital and other income" }
    ]
  },
  {
    id: "education",
    name: "Izobrazba",
    parameters: [
      { id: "educationTotal", name: "Izobrazba - SKUPAJ", field: "Education - TOTAL" },
      { id: "tertiary", name: "Terciarna izobrazba", field: "Tertiary" },
      { id: "upperSecondary", name: "Srednje\u0161olska izobrazba", field: "Upper secondary" },
      { id: "basicOrLess", name: "Osnovno\u0161olska ali manj", field: "Basic or less" }
    ]
  },
  {
    id: "migration",
    name: "Migracije",
    parameters: [
      { id: "labourMigrationIndex", name: "Indeks delovne migracije", field: "Labour migration index" },
      { id: "labourMigrationIndexMen", name: "Indeks delovne migracije - mo\u0161ki", field: "Labour migration index - men" },
      { id: "labourMigrationIndexWomen", name: "Indeks delovne migracije - \u017Eenske", field: "Labour migration index - women" }
    ]
  },
  {
    id: "employment",
    name: "Zaposlitev",
    parameters: [
      { id: "personsInEmploymentLocalRes", name: "Delovno aktivni v ob\u010Dini prebivali\u0161\u010Da", field: "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence" },
      { id: "personsInEmploymentLocalResMen", name: "Delovno aktivni v ob\u010Dini prebivali\u0161\u010Da - mo\u0161ki", field: "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence - men" },
      { id: "personsInEmploymentLocalResWomen", name: "Delovno aktivni v ob\u010Dini prebivali\u0161\u010Da - \u017Eenske", field: "Persons in employment [excluding farmers] whose workplace is in the municipality of their residence - women" }
    ]
  }
];
var dataQuerySchema = z.object({
  parameter: z.string(),
  year: z.coerce.number()
});

// server/storage.ts
import path from "path";

// server/utils/csvParser.ts
import fs from "fs";
import readline from "readline";
async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    let headers = [];
    let lineno = 0;
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    rl.on("line", (line) => {
      lineno++;
      if (!line.trim()) return;
      const values = parseCSVLine(line);
      if (lineno === 1) {
        headers = values;
      } else {
        const rowData = {};
        headers.forEach((header, index) => {
          const value = values[index] || "";
          if (!isNaN(Number(value)) && value !== "") {
            rowData[header] = Number(value);
          } else {
            rowData[header] = value;
          }
        });
        data.push(rowData);
      }
    });
    rl.on("close", () => {
      resolve(data);
    });
    rl.on("error", (err) => {
      reject(err);
    });
  });
}
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// server/storage.ts
var MemStorage = class {
  municipalityData = [];
  availableYears = {};
  constructor() {
  }
  async initializeData() {
    try {
      const csvFilePath = path.resolve(process.cwd(), "attached_assets", "prebivalstvo_zdruzeno.csv");
      const rawData = await parseCsvFile(csvFilePath);
      this.municipalityData = rawData;
      this.calculateAvailableYears();
      console.log(`Data initialized with ${this.municipalityData.length} records`);
    } catch (error) {
      console.error("Error initializing data:", error);
      throw new Error("Failed to initialize data");
    }
  }
  calculateAvailableYears() {
    const allParameters = parameterGroups.flatMap(
      (group) => group.parameters.map((param) => param.field)
    );
    allParameters.forEach((param) => {
      this.availableYears[param] = [];
    });
    for (const row of this.municipalityData) {
      const year = Number(row.leto);
      for (const param of allParameters) {
        const value = row[param];
        if (value !== void 0 && value !== null && value !== "" && value !== "z") {
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
  async getParametersAndAvailableYears() {
    return {
      parameterGroups,
      availableYears: this.availableYears
    };
  }
  async getMunicipalityData(parameter, year) {
    const data = this.municipalityData.filter((row) => Number(row.leto) === year).map((row) => {
      const value = row[parameter];
      let numValue = null;
      if (value !== void 0 && value !== null && value !== "" && value !== "z") {
        numValue = Number(value);
      }
      return {
        municipality: row.obcina,
        value: numValue
      };
    });
    const validValues = data.map((item) => item.value).filter((value) => value !== null).sort((a, b) => a - b);
    const min = validValues.length > 0 ? validValues[0] : null;
    const max = validValues.length > 0 ? validValues[validValues.length - 1] : null;
    const avg = validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : null;
    const middle = Math.floor(validValues.length / 2);
    const median = validValues.length > 0 ? validValues.length % 2 === 0 ? (validValues[middle - 1] + validValues[middle]) / 2 : validValues[middle] : null;
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
};
var storage = new MemStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  await storage.initializeData();
  app2.get("/api/parameters", async (_req, res) => {
    try {
      const data = await storage.getParametersAndAvailableYears();
      res.json(data);
    } catch (error) {
      console.error("Error fetching parameters:", error);
      res.status(500).json({ message: "Failed to fetch parameters" });
    }
  });
  app2.get("/api/data", async (req, res) => {
    try {
      const queryResult = dataQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: queryResult.error.errors
        });
      }
      const { parameter, year } = queryResult.data;
      const data = await storage.getMunicipalityData(parameter, year);
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to fetch data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path4 from "path";
import { fileURLToPath } from "url";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
app.use(express2.static(path4.join(__dirname, "public")));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
