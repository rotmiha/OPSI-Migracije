import { useEffect, useRef, useState, useCallback } from "react";
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
import RegijeDetail from "./RegijeDetail";

interface MapProps {
  data: Array<{
    municipality: string;
    region?: string;
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
  onZoomChange?: (zoom: number) => void;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(" regija", "")
    .replace("občina", "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

export default function Map({
  data,
  stats,
  selectedParameter,
  selectedParameterField,
  selectedYear,
  isLoading,
  isError,
  onZoomChange,
}: MapProps) {
  const [currentLayer, setCurrentLayer] = useState<"municipalities" | "regions" | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedMunicipalityData, setSelectedMunicipalityData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sloveniaGeoJson, setSloveniaGeoJson] = useState<any>(null);
  const [regijeGeoJson, setRegijeGeoJson] = useState<any>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [loadedMunicipalities, setLoadedMunicipalities] = useState(false);
  const [loadedRegions, setLoadedRegions] = useState(false);

  const getFeatureName = (feature: any): string => {
    if (!feature?.properties) return "";
    if (currentLayer === "municipalities") return feature.properties.OB_UIME || "";
    if (currentLayer === "regions") return feature.properties.SR_UIME || feature.properties.NAME_1 || "";
    return "";
  };

  const getStyle = useCallback((feature: any) => {
    const name = normalize(getFeatureName(feature));
    const item = data?.find(d => normalize((currentLayer === "municipalities" ? d.municipality : d.region) || "") === name);
    const value = item?.value;
    const min = stats?.min || 0;
    const max = stats?.max || 100;
    const fillColor = value != null ? getColorForValue(value, min, max) : currentLayer === "municipalities" ? "#f7f7f7" : "#ececec";

    return {
      fillColor,
      weight: currentLayer === "municipalities" && name === normalize(selectedMunicipality || "") ? 2 : 1,
      opacity: 1,
      color: currentLayer === "municipalities" && name === normalize(selectedMunicipality || "") ? "#252423" : "#999",
      fillOpacity: currentLayer === "municipalities" ? 0.7 : 0.6,
    };
  }, [data, stats, selectedMunicipality, currentLayer]);

    const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
      const name = getFeatureName(feature);
      const item = data?.find(d => normalize((currentLayer === "municipalities" ? d.municipality : d.region) || "") === normalize(name));

      const popup = `
        <div><strong>${name}</strong><br/>
        ${item?.value != null ? `${selectedParameter}: ${item.value.toLocaleString("sl-SI")}` : "Ni podatka"}</div>
      `;
      layer.bindTooltip(popup);



      console.log("onEachFeature", name, item);
      layer.on({
        click: () => {
          setSelectedMunicipality(name);
          setSelectedMunicipalityData(item);
          console.log("Clicked:", name, item);
        },
      });
    }, [data, selectedParameter, currentLayer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoJsonLayerRef.current || !searchTerm) return;

    const layer = geoJsonLayerRef.current;
    const normalizedSearch = normalize(searchTerm);
    let found = false;

    layer.eachLayer((l: any) => {
      const featureName = normalize(getFeatureName(l.feature));
      if (featureName.includes(normalizedSearch)) {
        const matchedItem = data?.find(
          (item) =>
            normalize((currentLayer === "municipalities" ? item.municipality : item.region) || "") === featureName
        );

        if (matchedItem) {
          setSelectedMunicipality(getFeatureName(l.feature));
          setSelectedMunicipalityData(matchedItem);
          found = true;

          const bounds = l.getBounds?.();
          if (bounds) l._map.fitBounds(bounds);

          return;
        }
      }
    });

    if (!found) {
      alert("Občina ni najdena. Poskusite znova.");
      setSelectedMunicipality(null);
      setSelectedMunicipalityData(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedMunicipality(null);
    setSelectedMunicipalityData(null);
  };

  const ZoomBasedGeoJsonLoader = ({
    onLoadMunicipalities,
    onLoadRegions,
    onZoomChange,
    onLayerChange,
  }: {
    onLoadMunicipalities: (data: any) => void;
    onLoadRegions: (data: any) => void;
    onZoomChange?: (zoom: number) => void;
    onLayerChange?: (layer: "municipalities" | "regions") => void;
  }) => {
    const previousZoom = useRef<number>(0);
    const map = useMap();

    useEffect(() => {
      const initialZoom = map.getZoom();
      previousZoom.current = initialZoom;

     if (!loadedMunicipalities) {
        fetch("/data/obcinepodatki.json")
          .then((res) => res.json())
          .then((data) => {
            onLoadMunicipalities(data);
            setLoadedMunicipalities(true);

            // Only switch layer AFTER data is loaded
            if (initialZoom >= 9) {
              setTimeout(() => {
                setCurrentLayer("municipalities");
                onLayerChange?.("municipalities");
              }, 0);
            }
          });
      }

        if (!loadedRegions) {
          fetch("/data/regije.json")
            .then((res) => res.json())
            .then((data) => {
              onLoadRegions(data);
              setLoadedRegions(true);

              if (initialZoom < 9) {
                setTimeout(() => {
                  setCurrentLayer("regions");
                  onLayerChange?.("regions");
                }, 0);
              }
            });
        }
    }, [map]);

    useEffect(() => {
      const ref = geoJsonLayerRef.current;
      if (!ref) return;

      ref.eachLayer((layer: any) => {
        const feature = layer.feature;
        if (!feature) return;

        const newStyle = getStyle(feature);
        layer.setStyle(newStyle);

        const name = getFeatureName(feature);
        const item = data?.find(d =>
          normalize((currentLayer === "municipalities" ? d.municipality : d.region) || "") === normalize(name)
        );

        const popup = `
          <div><strong>${name}</strong><br/>
          ${item?.value != null ? `${selectedParameter}: ${item.value.toLocaleString("sl-SI")}` : "Ni podatka"}</div>
        `;
        layer.unbindTooltip();
        layer.bindTooltip(popup);
      });
    }, [data, stats, selectedParameter, selectedMunicipality, currentLayer, getStyle]);


    useEffect(() => {
      if (!selectedMunicipality) {
        setSelectedMunicipalityData(null);
        return;
      }

      const match = data.find(d => {
        const name = normalize(selectedMunicipality);
        const source = currentLayer === "municipalities" ? d.municipality : d.region;
        return normalize(source || "") === name;
      });

      setSelectedMunicipalityData(match || null);
    }, [selectedMunicipality, currentLayer, data]);



    useEffect(() => {
      if (currentLayer !== "municipalities") {
        geoJsonLayerRef.current = null;
      }
    }, [currentLayer]);

    useMapEvents({
      zoomend: () => {
        const zoom = map.getZoom();
        if (onZoomChange) onZoomChange(zoom);

          if (zoom < 9 && previousZoom.current >= 9 && currentLayer !== "regions") {
            if (!loadedRegions) {
              fetch("/data/regije.json")
                .then((res) => res.json())
                .then((data) => {
                  onLoadRegions(data);
                  setLoadedRegions(true);
                  setTimeout(() => {
                    setCurrentLayer("regions");
                    onLayerChange?.("regions");
                  }, 0);
                });
            } else {
              setCurrentLayer("regions");
              onLayerChange?.("regions");
            }
          }

          if (zoom >= 9 && previousZoom.current < 9 && currentLayer !== "municipalities") {
            if (!loadedMunicipalities) {
              fetch("/data/obcinepodatki.json")
                .then((res) => res.json())
                .then((data) => {
                  onLoadMunicipalities(data);
                  setLoadedMunicipalities(true);
                  setTimeout(() => {
                    setCurrentLayer("municipalities");
                    onLayerChange?.("municipalities");
                  }, 0);
                });
            } else {
              setCurrentLayer("municipalities");
              onLayerChange?.("municipalities");
            }
}

        previousZoom.current = zoom;
      },
    });

    return null;
  };

  const ResetMapView = () => {
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
  };

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
            onLoadRegions={setRegijeGeoJson}
            onZoomChange={onZoomChange}
            onLayerChange={setCurrentLayer}
          />

          {sloveniaGeoJson && currentLayer === "municipalities" && (
            <GeoJSON
              key="municipalities"
              data={sloveniaGeoJson}
              style={getStyle}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
          )}

          {regijeGeoJson && currentLayer === "regions" && (
            <GeoJSON
              key="regions"
              data={regijeGeoJson}
              style={getStyle}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
          )}

          <ZoomControl position="topright" />
          <ResetMapView />
        </MapContainer>

        {currentLayer === "municipalities" && selectedMunicipality && selectedMunicipalityData && (
          <MunicipalityDetail
            municipalityName={selectedMunicipality}
            data={selectedMunicipalityData}
            parameterName={selectedParameter}
            year={selectedYear}
            stats={stats}
            onClose={handleCloseDetail}
          />
        )}


         {currentLayer === "regions" && selectedMunicipality && selectedMunicipalityData && (
           console.log("Rendering RegijeDetail", selectedMunicipality, selectedMunicipalityData),
          <RegijeDetail
            imeregije={selectedMunicipality}
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
