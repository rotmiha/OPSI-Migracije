export interface MunicipalityData {
  municipality: string;
  value: number | null;
}

export interface MunicipalityFeature {
  type: "Feature";
  properties: {
    OB_ID: string;
    OB_UIME: string;
    OB_SIFRA: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface Statistics {
  min: number | null;
  max: number | null;
  avg: number | null;
  median: number | null;
}
