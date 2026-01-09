import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, MapPin, Clock, AlertTriangle, Users, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ActiveWalk {
  id: string;
  userId: string;
  userName: string;
  mode: string;
  startTime: string;
  startLocation: { lat: number; lng: number };
  currentLocation: { lat: number; lng: number };
  checkIns: number;
  panicEvents: number;
  lastCheckIn: string | null;
}

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  return null;
};

const GuardianView = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [activeWalks, setActiveWalks] = useState<ActiveWalk[]>([]);
  const [selectedWalk, setSelectedWalk] = useState<ActiveWalk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadActiveWalks();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Set up refresh interval only when we have a selected walk
  useEffect(() => {
    if (isAuthenticated && selectedWalk) {
      // Refresh every 10 seconds
      const interval = setInterval(() => {
        refreshWalkLocation();
        // Also check for new panic events
        checkForPanicAlerts();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedWalk]);

  const loadActiveWalks = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.getGuardianActiveWalks();
      setActiveWalks(response.walks);
      if (response.walks.length > 0 && !selectedWalk) {
        setSelectedWalk(response.walks[0]);
      } else if (response.walks.length === 0) {
        setSelectedWalk(null);
      }
    } catch (error: any) {
      console.error("Failed to load active walks:", error);
      // Don't show error toast if it's just "no walks found"
      if (error.message && !error.message.includes("not found") && !error.message.includes("User not found")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load active walks",
          variant: "destructive",
        });
      }
      setActiveWalks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWalkLocation = async () => {
    if (!isAuthenticated || !selectedWalk) return;
    
    setIsRefreshing(true);
    try {
      const response = await api.getWalkLocation(selectedWalk.id);
      setActiveWalks(prev => prev.map(walk => 
        walk.id === selectedWalk.id 
          ? { ...walk, currentLocation: response.location, lastCheckIn: response.lastCheckIn, panicEvents: response.panicEvents }
          : walk
      ));
      setSelectedWalk(prev => prev ? {
        ...prev,
        currentLocation: response.location,
        lastCheckIn: response.lastCheckIn,
        panicEvents: response.panicEvents,
      } : null);
    } catch (error: any) {
      console.error("Failed to refresh location:", error);
      // If walk no longer exists, reload the list
      if (error.message && error.message.includes("not found")) {
        loadActiveWalks();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkForPanicAlerts = async () => {
    if (!isAuthenticated || !selectedWalk) return;
    
    try {
      const response = await api.getWalkLocation(selectedWalk.id);
      const previousPanicCount = selectedWalk.panicEvents;
      
      if (previousPanicCount < response.panicEvents) {
        // New panic event detected
        toast({
          title: "🚨 Panic Alert!",
          description: `${selectedWalk.userName} has triggered the panic button! Check their location immediately.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check for panic alerts:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="border border-border/30 p-8 bg-card rounded-lg text-center">
            <p className="text-sm text-foreground/80 mb-2">
              Please log in to view active walks
            </p>
            <Button onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-foreground/80 text-center">Loading active walks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background border-b border-border/30 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-medium text-foreground">Active Walks</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActiveWalks}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {activeWalks.length === 0 ? (
        <div className="p-4">
          <div className="max-w-md mx-auto border border-border/30 p-8 bg-card rounded-lg text-center">
            <Users className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
            <p className="text-sm text-foreground/80 mb-2">
              No active walks to monitor
            </p>
            <p className="text-xs text-foreground/60">
              When someone starts a walk with you as a guardian, it will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Map View */}
          {selectedWalk && (
            <div className="flex-1 relative">
              <MapContainer
                center={[selectedWalk.currentLocation.lat, selectedWalk.currentLocation.lng]}
                zoom={15}
                className="h-full w-full z-0"
                zoomControl={false}
              >
                <MapController center={[selectedWalk.currentLocation.lat, selectedWalk.currentLocation.lng]} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker
                  position={[selectedWalk.currentLocation.lat, selectedWalk.currentLocation.lng]}
                />
                {selectedWalk.startLocation && (
                  <Marker
                    position={[selectedWalk.startLocation.lat, selectedWalk.startLocation.lng]}
                    icon={new L.DivIcon({
                      html: `<div style="width:12px;height:12px;background:#3d9970;border-radius:50%;border:2px solid #0a0a0a"></div>`,
                      className: "",
                      iconSize: [12, 12],
                      iconAnchor: [6, 6],
                    })}
                  />
                )}
              </MapContainer>
              
              {/* Walk Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-background/95 backdrop-blur-sm border border-border/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedWalk.userName}</p>
                      <p className="text-xs text-foreground/80">
                        Started {formatTime(selectedWalk.startTime)}
                      </p>
                    </div>
                    {selectedWalk.panicEvents > 0 && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">Panic</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-foreground/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedWalk.checkIns} check-ins</span>
                    </div>
                    {selectedWalk.lastCheckIn && (
                      <span>Last: {formatTime(selectedWalk.lastCheckIn)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Walk List */}
          <div className="border-t border-border/30 bg-background p-4 max-h-48 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-2">
              {activeWalks.map((walk) => (
                <div
                  key={walk.id}
                  onClick={() => setSelectedWalk(walk)}
                  className={`border border-border/30 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWalk?.id === walk.id ? "bg-primary/10 border-primary" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {walk.userName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-foreground/80 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>Started {formatTime(walk.startTime)}</span>
                      </div>
                    </div>
                    {walk.panicEvents > 0 && (
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianView;
