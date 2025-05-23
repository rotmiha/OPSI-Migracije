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
  selectedParameterField: string;
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
  selectedParameterField,
  selectedYear, 
  isLoading, 
  isError 
}: MapProps) {
  const [sloveniaGeoJson, setSloveniaGeoJson] = useState<any>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedMunicipalityData, setSelectedMunicipalityData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Fetch Slovenia GeoJSON from backend
  useEffect(() => {
    fetch("/api/geojson")
      .then(response => response.json())
      .then(data => {
        console.log("Successfully loaded Slovenia GeoJSON data from backend");
        setSloveniaGeoJson(data);
      })
      .catch(error => {
        console.error("Error fetching Slovenia GeoJSON:", error);
      });
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
    <div className="w-full h-full flex flex-col">
      {/* Map Controls Toolbar */}
      <div className="bg-white border-b border-neutral-light p-3 flex justify-between items-center z-30 relative">
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Input 
              type="text" 
              placeholder="Išči občino..." 
              className="w-full px-3 py-1.5 pr-8"
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
      </div>

      {/* Map Container - Full size with scrollable interaction */}
      <div className="relative flex-grow bg-neutral-lighter" style={{ touchAction: 'auto' }}>
        {/* Slovenia Map */}
        {sloveniaGeoJson ? (
          <MapContainer 
            center={[46.119944, 14.815333]} 
            zoom={8} 
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            boxZoom={true}
            keyboard={true}
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
