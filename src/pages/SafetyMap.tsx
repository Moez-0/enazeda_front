import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TUNIS_CENTER: [number, number] = [36.8065, 10.1815];

const safeIcon = new L.DivIcon({
  html: `<div style="width:12px;height:12px;background:#3d9970;border-radius:50%;border:2px solid #0a0a0a"></div>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const MapController = () => {
  const map = useMap();
  useEffect(() => {
    map.setView(TUNIS_CENTER, 14);
  }, [map]);
  return null;
};

const getHeatColor = (intensity: number) => {
  if (intensity >= 0.7) return "#c0392b";
  if (intensity >= 0.4) return "#d35400";
  return "#f39c12";
};

const SafetyMap = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showSafeSpaces, setShowSafeSpaces] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"24h" | "7d" | "30d">("7d");
  const [heatmapData, setHeatmapData] = useState<Array<{ lat: number; lng: number; count: number; types: Record<string, number> }>>([]);
  const [safeSpaces, setSafeSpaces] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(TUNIS_CENTER);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentLocation(loc);
          loadMapData(loc.lat, loc.lng);
        },
        () => {
          loadMapData(TUNIS_CENTER[0], TUNIS_CENTER[1]);
        }
      );
    } else {
      loadMapData(TUNIS_CENTER[0], TUNIS_CENTER[1]);
    }
  }, [timeFilter]);

  const loadMapData = async (lat: number, lng: number) => {
    try {
      if (isAuthenticated) {
        // Load heatmap data from backend
        const heatmapRes = await api.getHeatmap(lat, lng, 5000);
        setHeatmapData(heatmapRes.reports || []);

        // Load safe spaces
        const spacesRes = await api.getNearbySafeSpaces(lat, lng, 5000);
        setSafeSpaces(
          spacesRes.safeSpaces.map((s: any) => ({
            lat: s.location.lat,
            lng: s.location.lng,
            name: s.name,
          }))
        );
      } else {
        // Fallback to mock data
        setHeatmapData([
          { lat: 36.8089, lng: 10.1657, count: 5, types: { verbal: 3, physical: 2 } },
          { lat: 36.8012, lng: 10.1799, count: 3, types: { verbal: 2, stalking: 1 } },
        ]);
        setSafeSpaces([
          { lat: 36.8055, lng: 10.1823, name: "Café Saf Saf" },
          { lat: 36.8123, lng: 10.1701, name: "Pharmacie Centrale" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load map data:", error);
      // Fallback to mock data
      setHeatmapData([
        { lat: 36.8089, lng: 10.1657, count: 5, types: { verbal: 3, physical: 2 } },
      ]);
    }
  };

  const getIntensity = (count: number) => {
    // Normalize intensity based on count
    if (count >= 10) return 0.9;
    if (count >= 5) return 0.7;
    if (count >= 2) return 0.5;
    return 0.3;
  };

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={TUNIS_CENTER}
        zoom={14}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <MapController />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {heatmapData.map((incident, index) => {
          const intensity = getIntensity(incident.count);
          return (
            <Circle
              key={index}
              center={[incident.lat, incident.lng]}
              radius={150 + intensity * 200}
              pathOptions={{
                color: getHeatColor(intensity),
                fillColor: getHeatColor(intensity),
                fillOpacity: 0.25 + intensity * 0.2,
                weight: 0,
              }}
            />
          );
        })}

        {showSafeSpaces &&
          safeSpaces.map((space, index) => (
            <Marker
              key={`safe-${index}`}
              position={[space.lat, space.lng]}
              icon={safeIcon}
            />
          ))}
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-background/95 backdrop-blur-sm border border-border/30 p-3 max-w-sm rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">{t("map.location")}</p>
              <p className="text-xs text-foreground/80">{t("map.safetymap")}</p>
            </div>
            <Button
              variant={showSafeSpaces ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowSafeSpaces(!showSafeSpaces)}
            >
              {t("map.safeplaces")}
            </Button>
          </div>
          <div className="flex gap-1">
            {(["24h", "7d", "30d"] as const).map((time) => (
              <Button
                key={time}
                variant={timeFilter === time ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
                onClick={() => setTimeFilter(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 z-10 bg-background/95 backdrop-blur-sm border border-border/30 p-3 rounded-lg">
        <p className="text-xs text-foreground/80 mb-2">{t("map.risklevel")}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#c0392b]" />
            <span className="text-foreground/90">{t("map.high")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#d35400]" />
            <span className="text-foreground/90">{t("map.medium")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-safe" />
            <span className="text-foreground/90">{t("map.safespace")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
