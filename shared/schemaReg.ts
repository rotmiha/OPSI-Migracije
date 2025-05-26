import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { z } from "zod";

// Glavna struktura za podatke regij
export const regionData = pgTable("region_data", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  year: integer("year").notNull(),
  // Prihodki
  grossIncome: numeric("gross_income"),
  incomeFromWork: numeric("income_from_work"),
  parentalFamilySocialBenefits: numeric("parental_family_social_benefits"),
  pensions: numeric("pensions"),
  propertyCapitalOtherIncome: numeric("property_capital_other_income"),
  // Izobrazba
  basicOrLess: integer("basic_or_less"),
  educationTotal: integer("education_total"),
  tertiary: integer("tertiary"),
  upperSecondary: integer("upper_secondary"),
  // Migracije
  labourMigrationIndex: numeric("labour_migration_index"),
  labourMigrationIndexMen: numeric("labour_migration_index_men"),
  labourMigrationIndexWomen: numeric("labour_migration_index_women"),
  // Zaposlitev
  personsInEmploymentLocalRes: numeric("persons_in_employment_local_res"),
  personsInEmploymentLocalResMen: numeric("persons_in_employment_local_res_men"),
  personsInEmploymentLocalResWomen: numeric("persons_in_employment_local_res_women"),
});

// Parametrske skupine za UI
export const parameterGroupsReg = [
  {
    id: "income",
    name: "Prihodki",
    parameters: [
      { id: "grossIncome", name: "Bruto dohodek - SKUPAJ", field: "Gross income - TOTAL" },
      { id: "incomeFromWork", name: "Dohodek iz dela", field: "Income from work" },
      { id: "parentalFamilySocialBenefits", name: "Starševski, družinski in socialni prejemki", field: "Parental, family and social benefits" },
      { id: "pensions", name: "Pokojnine", field: "Pensions" },
      { id: "propertyCapitalOtherIncome", name: "Dohodek iz premoženja, kapitala in drugi", field: "Property, capital and other income" }
    ]
  },
  {
    id: "education",
    name: "Izobrazba",
    parameters: [
      { id: "educationTotal", name: "Izobrazba - SKUPAJ", field: "Education - TOTAL" },
      { id: "tertiary", name: "Terciarna izobrazba", field: "Tertiary" },
      { id: "upperSecondary", name: "Srednješolska izobrazba", field: "Upper secondary" },
      { id: "basicOrLess", name: "Osnovnošolska ali manj", field: "Basic or less" }
    ]
  },
  {
    id: "migration",
    name: "Migracije",
    parameters: [
      { id: "labourMigrationIndex", name: "Indeks delovne migracije", field: "Labour migration index" },
      { id: "labourMigrationIndexMen", name: "Indeks delovne migracije - moški", field: "Labour migration index - men" },
      { id: "labourMigrationIndexWomen", name: "Indeks delovne migracije - ženske", field: "Labour migration index - women" }
    ]
  },
  {
    id: "employment",
    name: "Zaposlitev",
    parameters: [
      { id: "personsInEmploymentLocalRes", name: "Delovno aktivni v regiji prebivališča", field: "Persons in employment [excluding farmers] whose workplace is in the statistical region of their residence" },
      { id: "personsInEmploymentLocalResMen", name: "Delovno aktivni v regiji prebivališča - moški", field: "Persons in employment [excluding farmers] whose workplace is in the statistical region of their residence - men" },
      { id: "personsInEmploymentLocalResWomen", name: "Delovno aktivni v regiji prebivališča - ženske", field: "Persons in employment [excluding farmers] whose workplace is in the statistical region of their residence - women" }
    ]
  }
];

// Tipi podatkov
export type RegionData = typeof regionData.$inferSelect;
export type RegionRawData = Record<string, string | number>;

// Odzivi za API
export interface ParameterGroup {
  id: string;
  name: string;
  parameters: Array<{
    id: string;
    name: string;
    field: string;
  }>;
}

export interface ParameterYearsResponse {
  parameterGroups: ParameterGroup[];
  availableYears: Record<string, number[]>;
}

export interface RegionDataResponse {
  data: Array<{
    region: string;
    value: number | null;
  }>;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  };
}

// Shema za validacijo query parametrov
export const dataQuerySchema = z.object({
  parameter: z.string(),
  year: z.coerce.number(),
});
