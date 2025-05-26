import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Loader2,
  Search,
  RotateCcw,
} from "lucide-react";
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

function ZoomBasedGeoJsonLoader({
  onLoadMunicipalities,
  onUnloadMunicipalities,
  onLoadRegions,
  onUnloadRegions,
}: {
  onLoadMunicipalities: (data: any) => void;
  onUnloadMunicipalities: () => void;
  onLoadRegions: (data: any) => void;
  onUnloadRegions: () => void;
}) {
  const previousZoom = useRef<number>(0);
  const map = useMap();
  const [currentLayer, setCurrentLayer] = useState<"municipalities" | "regions" | null>(null);

  useEffect(() => {
    const initialZoom = map.getZoom();
    previousZoom.current = initialZoom;
    if (initialZoom >= 9) {
      fetch("/data/obcinepodatki.json")
        .then((res) => res.json())
        .then((data) => {
          onLoadMunicipalities(data);
          setCurrentLayer("municipalities");
        });
    } else {
      fetch("/data/regije.json")
        .then((res) => res.json())
        .then((data) => {
          onLoadRegions(data);
          setCurrentLayer("regions");
        });
    }
  }, [map]);

  useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      const prevZoom = previousZoom.current;

      if (zoom < 9 && prevZoom >= 9 && currentLayer !== "regions") {
        onUnloadMunicipalities();
        fetch("/data/regije.json")
          .then((res) => res.json())
          .then((data) => {
            onLoadRegions(data);
            setCurrentLayer("regions");
          });
      }

      if (zoom >= 9 && prevZoom < 9 && currentLayer !== "municipalities") {
        onUnloadRegions();
        fetch("/data/obcinepodatki.json")
          .then((res) => res.json())
          .then((data) => {
            onLoadMunicipalities(data);
            setCurrentLayer("municipalities");
          });
      }

      previousZoom.current = zoom;
    },
  });

  return null;
}

export default function Map({
  data,
  stats,
  selectedParameter,
  selectedParameterField,
  selectedYear,
  isLoading,
  isError,
}: MapProps) {
  const [sloveniaGeoJson, setSloveniaGeoJson] = useState<any>(null);
  const [regijeGeoJson, setRegijeGeoJson] = useState<any>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedMunicipalityData, setSelectedMunicipalityData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const style = (feature: any) => {
    const municipalityName = feature.properties.OB_UIME.toLowerCase();
    const municipalityData = data?.find(
      (item) => item.municipality.toLowerCase() === municipalityName
    );
    const value = municipalityData?.value;

    const min = stats?.min ?? 0;
    const max = stats?.max ?? 100;

    let fillColor = "#f7f7f7"; // fallback fill color

    if (value !== null && value !== undefined) {
      fillColor = getColorForValue(value, min, max);
    }

    return {
      fillColor,
      weight: municipalityName === selectedMunicipality?.toLowerCase() ? 2 : 0.5,
      opacity: 1,
      color: municipalityName === selectedMunicipality?.toLowerCase() ? "#252423" : "#ffffff",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const municipalityName = feature.properties.OB_UIME;
    const municipalityData = data?.find(
      (item) => item.municipality.toLowerCase() === municipalityName.toLowerCase()
    );

    const popupContent = `
      <div>
        <strong>${municipalityName}</strong>
        ${
          municipalityData && municipalityData.value !== null
            ? `<br/>${selectedParameter}: ${municipalityData.value?.toLocaleString("sl-SI") ?? "Ni podatka"}`
            : "<br/>Ni podatka"
        }
      </div>
    `;
    layer.bindTooltip(popupContent);
    layer.on({
      click: () => {
        setSelectedMunicipality(municipalityName);
        setSelectedMunicipalityData(municipalityData);
      },
    });
  };

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
        const municipalityData = data?.find(
          (item) => item.municipality.toLowerCase() === municipalityName
        );
        setSelectedMunicipalityData(municipalityData);
        found = true;
      }
    });
  };

  const handleCloseDetail = () => {
    setSelectedMunicipality(null);
    setSelectedMunicipalityData(null);
  };

  useEffect(() => {
    if (!geoJsonLayerRef.current) return;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const municipalityName = layer.feature.properties.OB_UIME;
      const municipalityData = data?.find(
        (item) => item.municipality.toLowerCase() === municipalityName.toLowerCase()
      );

      const tooltipContent = `
        <div>
          <strong>${municipalityName}</strong>
          ${
            municipalityData && municipalityData.value !== null
              ? `<br/>${selectedParameter}: ${municipalityData.value?.toLocaleString("sl-SI") ?? "Ni podatka"}`
              : "<br/>Ni podatka"
          }
        </div>
      `;

      layer.unbindTooltip();
      layer.bindTooltip(tooltipContent);
    });
  }, [selectedParameter, data]);



  useEffect(() => {
  if (!selectedMunicipality) return;

  const updatedData = data.find(
    (item) => item.municipality.toLowerCase() === selectedMunicipality.toLowerCase()
  );

  setSelectedMunicipalityData(updatedData);
}, [data, selectedMunicipality]);


  return (
    <div className="w-full h-full flex flex-col">
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

      <div className="relative flex-grow bg-neutral-lighter" style={{ touchAction: "auto" }}>
        <MapContainer
          center={[46.119944, 14.815333]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomBasedGeoJsonLoader
            onLoadMunicipalities={setSloveniaGeoJson}
            onUnloadMunicipalities={() => setSloveniaGeoJson(null)}
            onLoadRegions={setRegijeGeoJson}
            onUnloadRegions={() => setRegijeGeoJson(null)}
          />

          {sloveniaGeoJson && (
            <GeoJSON
            data={sloveniaGeoJson}
            style={style}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}
          />
          )}

          {regijeGeoJson && (
            <GeoJSON
              data={regijeGeoJson}
              style={{ fillColor: "#dcdcdc", color: "#555", weight: 1, fillOpacity: 0.5 }}
            />
          )}

          <ZoomControl position="topright" />
          <ResetMapView />
        </MapContainer>

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

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="mt-3 text-neutral-dark">Nalaganje podatkov...</p>
            </div>
          </div>
        )}

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
