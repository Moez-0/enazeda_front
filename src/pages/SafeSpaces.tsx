import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SafeSpace {
  id: string;
  name: string;
  type: string;
  location: { lat: number; lng: number; address?: string };
  isOpen: boolean;
  verified: boolean;
  hours?: { open: string; close: string };
}

const SafeSpaces = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [safeSpaces, setSafeSpaces] = useState<SafeSpace[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
          loadSafeSpaces(loc.lat, loc.lng);
        },
        () => {
          // Fallback to Tunis coordinates
          const loc = { lat: 36.8065, lng: 10.1815 };
          setCurrentLocation(loc);
          loadSafeSpaces(loc.lat, loc.lng);
        }
      );
    } else {
      const loc = { lat: 36.8065, lng: 10.1815 };
      setCurrentLocation(loc);
      loadSafeSpaces(loc.lat, loc.lng);
    }
  }, []);

  const loadSafeSpaces = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await api.getNearbySafeSpaces(lat, lng, 5000);
      setSafeSpaces(response.safeSpaces);
    } catch (error) {
      // Fallback to mock data
      setSafeSpaces([
        {
          id: "1",
          name: "Café Saf Saf",
          type: "cafe",
          location: { lat: lat + 0.001, lng: lng + 0.001, address: "Avenue Habib Bourguiba" },
          isOpen: true,
          verified: true,
        },
        {
          id: "2",
          name: "Pharmacie Centrale",
          type: "pharmacy",
          location: { lat: lat + 0.002, lng: lng + 0.001, address: "Rue de Rome" },
          isOpen: true,
          verified: true,
        },
      ]);
      toast({
        title: "Using demo data",
        description: "Could not load safe spaces from server",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (space: SafeSpace): string => {
    if (!currentLocation) return "—";
    const R = 6371; // Earth's radius in km
    const dLat = ((space.location.lat - currentLocation.lat) * Math.PI) / 180;
    const dLon = ((space.location.lng - currentLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentLocation.lat * Math.PI) / 180) *
        Math.cos((space.location.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };
  
  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-xs text-foreground/80 mb-1">{t("safespaces.title")}</p>
          <h1 className="text-xl font-medium text-foreground">{t("safespaces.verified")}</h1>
        </div>

        <div className="flex items-center justify-between border border-border/30 p-3 mb-6 bg-card rounded-lg">
          <div>
            <p className="text-sm text-foreground">Tunis, Tunisia</p>
            <p className="text-xs text-foreground/80">{t("safespaces.current")}</p>
          </div>
          <Button variant="ghost" size="sm">
            {t("safespaces.change")}
          </Button>
        </div>

        {isLoading ? (
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <p className="text-sm text-foreground/80">Loading safe spaces...</p>
          </div>
        ) : safeSpaces.length === 0 ? (
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <p className="text-sm text-foreground/80 mb-2">
              No safe spaces found nearby
            </p>
            <p className="text-xs text-foreground/60">
              Try changing your location or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeSpaces.map((space) => (
              <div
                key={space.id}
                className="border border-border/30 p-4 flex items-start justify-between bg-card rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate text-foreground">{space.name}</p>
                    {space.verified && (
                      <span className="text-xs text-safe">{t("safespaces.verified_badge")}</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80 mb-2">
                    {space.location.address || `${space.location.lat.toFixed(4)}, ${space.location.lng.toFixed(4)}`}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-foreground/80">
                    <span>{calculateDistance(space)}</span>
                    <span className={space.isOpen ? "text-safe" : ""}>
                      {space.isOpen ? t("safespaces.open") : t("safespaces.closed")}
                    </span>
                    <span className="capitalize">{space.type}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${space.location.lat},${space.location.lng}`;
                    window.open(url, "_blank");
                  }}
                >
                  {t("safespaces.directions")}
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-foreground/80 mt-8">
          {t("safespaces.footer")}
        </p>
      </div>
    </div>
  );
};

export default SafeSpaces;
