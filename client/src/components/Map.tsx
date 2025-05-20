import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Search, Plus, Minus, RotateCcw, Maximize, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MunicipalityDetail from "./MunicipalityDetail";
import { getColorForValue } from "@/lib/mapUtils";

interface MapProps {
  data: Array<{
    municipality: string;
    value: number | null;
  }>;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
  } | undefined;
  selectedParameter: string;
  selectedYear: number | null;
  isLoading: boolean;
  isError: boolean;
}

// Component to handle map reset
function ResetMapView() {
  const map = useMap();
  
  const handleReset = () => {
    map.setView([46.119944, 14.815333], 8);
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="p-1.5 rounded-md bg-white hover:bg-neutral-lighter" 
      onClick={handleReset}
      title="Reset View"
    >
      <RotateCcw className="w-5 h-5 text-neutral-dark" />
    </Button>
  );
}

export default function Map({ 
  data, 
  stats, 
  selectedParameter, 
  selectedYear, 
  isLoading, 
  isError 
}: MapProps) {
  const [sloveniaGeoJson, setSloveniaGeoJson] = useState<any>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedMunicipalityData, setSelectedMunicipalityData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Static GeoJSON data for Slovenia municipalities
  useEffect(() => {
    // Wait for 1 second to ensure other components have loaded
    const timer = setTimeout(() => {
      // Create a hard-coded simplified dataset for Slovenian municipalities
      // This is a minimal example with just a few municipalities for testing
      const dummyGeoJson = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "1",
              "OB_UIME": "Ljubljana",
              "OB_SIFRA": "61"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[14.5, 46.05], [14.55, 46.05], [14.55, 46.1], [14.5, 46.1], [14.5, 46.05]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "2",
              "OB_UIME": "Maribor",
              "OB_SIFRA": "70"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[15.6, 46.55], [15.7, 46.55], [15.7, 46.65], [15.6, 46.65], [15.6, 46.55]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "3",
              "OB_UIME": "Celje",
              "OB_SIFRA": "11"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[15.25, 46.22], [15.3, 46.22], [15.3, 46.27], [15.25, 46.27], [15.25, 46.22]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "4",
              "OB_UIME": "Koper",
              "OB_SIFRA": "50"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[13.7, 45.52], [13.8, 45.52], [13.8, 45.62], [13.7, 45.62], [13.7, 45.52]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "5",
              "OB_UIME": "Kranj",
              "OB_SIFRA": "52"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[14.33, 46.22], [14.43, 46.22], [14.43, 46.32], [14.33, 46.32], [14.33, 46.22]]]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "OB_ID": "6",
              "OB_UIME": "ajdovščina",
              "OB_SIFRA": "1"
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[13.85, 45.85], [14.0, 45.85], [14.0, 46.0], [13.85, 46.0], [13.85, 45.85]]]
            }
          }
        ]
      };
      
      console.log("Using local Slovenia GeoJSON data");
      setSloveniaGeoJson(dummyGeoJson);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Set style for each municipality
  const style = (feature: any) => {
    const municipalityName = feature.properties.OB_UIME.toLowerCase();
    
    // Find the data for this municipality
    const municipalityData = data?.find(
      item => item.municipality.toLowerCase() === municipalityName
    );
    
    const value = municipalityData?.value;
    const min = stats?.min || 0;
    const max = stats?.max || 100;
    
    let fillColor = "#f7f7f7"; // Default color
    
    if (value !== null && value !== undefined) {
      fillColor = getColorForValue(value, min, max);
    }
    
    return {
      fillColor,
      weight: feature.properties.OB_UIME.toLowerCase() === selectedMunicipality?.toLowerCase() ? 2 : 0.5,
      opacity: 1,
      color: feature.properties.OB_UIME.toLowerCase() === selectedMunicipality?.toLowerCase() ? "#252423" : "#ffffff",
      fillOpacity: 0.7
    };
  };

  // On each feature (municipality) interaction
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const municipalityName = feature.properties.OB_UIME;
    
    // Find the data for this municipality
    const municipalityData = data?.find(
      item => item.municipality.toLowerCase() === municipalityName.toLowerCase()
    );
    
    // Popup content
    const popupContent = `
      <div>
        <strong>${municipalityName}</strong>
        ${municipalityData && municipalityData.value !== null 
          ? `<br/>${selectedParameter}: ${municipalityData.value.toLocaleString('sl-SI')}` 
          : '<br/>Ni podatka'}
      </div>
    `;
    
    layer.bindTooltip(popupContent);
    
    // Add click event
    layer.on({
      click: () => {
        setSelectedMunicipality(municipalityName);
        setSelectedMunicipalityData(municipalityData);
      }
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!geoJsonLayerRef.current || !searchTerm) return;
    
    const layer = geoJsonLayerRef.current;
    let found = false;
    
    layer.eachLayer((l: any) => {
      if (found) return;
      
      const municipalityName = l.feature.properties.OB_UIME.toLowerCase();
      if (municipalityName.includes(searchTerm.toLowerCase())) {
        setSelectedMunicipality(l.feature.properties.OB_UIME);
        
        // Find the data for this municipality
        const municipalityData = data?.find(
          item => item.municipality.toLowerCase() === municipalityName
        );
        setSelectedMunicipalityData(municipalityData);
        
        found = true;
      }
    });
  };

  // Handle closing detail panel
  const handleCloseDetail = () => {
    setSelectedMunicipality(null);
    setSelectedMunicipalityData(null);
  };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      {/* Map Controls Toolbar */}
      <div className="bg-white border-b border-neutral-light p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded-md hover:bg-neutral-lighter" 
            title="Zoom In"
            onClick={() => {
              const mapElement = document.querySelector(".leaflet-container");
              if (mapElement) {
                const map = (mapElement as any)._leaflet_map;
                if (map) map.zoomIn();
              }
            }}
          >
            <Plus className="w-5 h-5 text-neutral-dark" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded-md hover:bg-neutral-lighter" 
            title="Zoom Out"
            onClick={() => {
              const mapElement = document.querySelector(".leaflet-container");
              if (mapElement) {
                const map = (mapElement as any)._leaflet_map;
                if (map) map.zoomOut();
              }
            }}
          >
            <Minus className="w-5 h-5 text-neutral-dark" />
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Išči občino..." 
              className="w-64 px-3 py-1.5 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full"
            >
              <Search className="w-4 h-4 text-neutral-dark" />
            </Button>
          </div>
        </form>
        
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="inline-flex items-center px-3 py-1.5"
          >
            <Menu className="w-4 h-4 mr-1 text-neutral-dark" />
            Filtri
          </Button>
          
          <div className="ml-2 flex">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-1.5 rounded-md hover:bg-neutral-lighter" 
              title="Full Screen"
              onClick={() => {
                const mapContainer = document.querySelector(".leaflet-container");
                if (mapContainer && document.fullscreenEnabled) {
                  if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen().catch(err => {
                      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                  } else {
                    document.exitFullscreen();
                  }
                }
              }}
            >
              <Maximize className="w-5 h-5 text-neutral-dark" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-grow bg-neutral-lighter overflow-hidden">
        {/* Slovenia Map */}
        {sloveniaGeoJson ? (
          <MapContainer 
            center={[46.119944, 14.815333]} 
            zoom={8} 
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON 
              data={sloveniaGeoJson} 
              style={style} 
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
            <ZoomControl position="topright" />
            <ResetMapView />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        
        {/* Municipality Detail Panel */}
        {selectedMunicipality && selectedMunicipalityData && (
          <MunicipalityDetail
            municipalityName={selectedMunicipality}
            data={selectedMunicipalityData}
            parameterName={selectedParameter}
            year={selectedYear}
            stats={stats}
            onClose={handleCloseDetail}
          />
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="mt-3 text-neutral-dark">Nalaganje podatkov...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {isError && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <p className="text-lg font-medium text-destructive">Napaka pri nalaganju podatkov</p>
              <p className="mt-1 text-neutral-dark">Poskusite ponovno.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
