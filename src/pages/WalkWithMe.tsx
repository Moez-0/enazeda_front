import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { MapPin, Phone, AlertTriangle, Users, Clock, Shield } from "lucide-react";

type WalkMode = "friend" | "guardian" | "safe-place" | null;

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface Guardian {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface WalkSession {
  id: string;
  mode: WalkMode;
  startTime: Date;
  contacts: Contact[];
  guardians: Guardian[];
  location: { lat: number; lng: number };
  checkIns: Date[];
  panicEvents: Date[];
}

const WalkWithMe = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<WalkMode>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [walkTime, setWalkTime] = useState(0);
  const [checkInTimer, setCheckInTimer] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGuardians, setSelectedGuardians] = useState<string[]>([]);
  const [showContactSelection, setShowContactSelection] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sharedWith, setSharedWith] = useState<{ contacts: Contact[]; guardians: Guardian[] }>({ contacts: [], guardians: [] });
  
  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkInIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const walkSessionRef = useRef<WalkSession | null>(null);

  const { isAuthenticated } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [trustedGuardians, setTrustedGuardians] = useState<Guardian[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
    // Get initial location
    updateLocation();
  }, []);

  const loadContacts = async () => {
    if (isAuthenticated) {
      try {
        const [contactsRes, guardiansRes] = await Promise.all([
          api.getContacts("emergency"),
          api.getContacts("guardian"),
        ]);
        setEmergencyContacts(contactsRes.contacts);
        setTrustedGuardians(guardiansRes.contacts);
      } catch (error) {
        // Fallback to localStorage
        const contacts = JSON.parse(localStorage.getItem("enazeda_emergency_contacts") || "[]");
        const guardians = JSON.parse(localStorage.getItem("enazeda_guardians") || "[]");
        setEmergencyContacts(contacts);
        setTrustedGuardians(guardians);
      }
    } else {
      const contacts = JSON.parse(localStorage.getItem("enazeda_emergency_contacts") || "[]");
      const guardians = JSON.parse(localStorage.getItem("enazeda_guardians") || "[]");
      setEmergencyContacts(contacts);
      setTrustedGuardians(guardians);
    }
  };

  useEffect(() => {
    if (isWalking) {
      // Start walk timer
      walkIntervalRef.current = setInterval(() => {
        setWalkTime((prev) => prev + 1);
      }, 1000);

      // Start check-in timer (every 5 minutes)
      checkInIntervalRef.current = setInterval(() => {
        setCheckInTimer((prev) => {
          if (prev >= 300) { // 5 minutes
            handleCheckIn();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      // Get initial location
      updateLocation();
      
      // Update location periodically
      locationIntervalRef.current = setInterval(() => {
        updateLocation();
      }, 10000); // Update every 10 seconds
      
      // Update location on backend separately
      const backendUpdateInterval = setInterval(() => {
        if (currentSessionId && currentLocation) {
          api.updateWalkLocation(currentSessionId, currentLocation).catch(console.error);
        }
      }, 10000); // Update backend every 10 seconds
      
      // Store interval ref for cleanup
      (locationIntervalRef as any).backendInterval = backendUpdateInterval;

      return () => {
        if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
        if (checkInIntervalRef.current) clearInterval(checkInIntervalRef.current);
        if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        if ((locationIntervalRef as any).backendInterval) {
          clearInterval((locationIntervalRef as any).backendInterval);
        }
      };
    }
  }, [isWalking]);

  const updateLocation = () => {
    // Simulate location (in real app, use Geolocation API)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to simulated location (Tunis coordinates)
          setCurrentLocation({
            lat: 36.8065 + (Math.random() - 0.5) * 0.01,
            lng: 10.1815 + (Math.random() - 0.5) * 0.01,
          });
        }
      );
    } else {
      // Fallback to simulated location
      setCurrentLocation({
        lat: 36.8065 + (Math.random() - 0.5) * 0.01,
        lng: 10.1815 + (Math.random() - 0.5) * 0.01,
      });
    }
  };

  const handleCheckIn = async () => {
    if (walkSessionRef.current) {
      walkSessionRef.current.checkIns.push(new Date());
      
      if (isAuthenticated && currentSessionId) {
        try {
          await api.checkIn(currentSessionId);
        } catch (error) {
          console.error("Failed to send check-in:", error);
        }
      }
      
      toast({
        title: t("walk.checkin.sent"),
        description: t("walk.checkin.sent.desc"),
      });
    }
  };

  const handlePanic = async () => {
    if (!walkSessionRef.current || !currentLocation) return;

    // Add panic event to session
    walkSessionRef.current.panicEvents.push(new Date());

    // Trigger panic on backend
    if (isAuthenticated && currentSessionId) {
      try {
        await api.triggerPanic(currentSessionId, currentLocation);
      } catch (error) {
        console.error("Failed to trigger panic:", error);
      }
    }

    // Alert all emergency contacts
    const allContacts = [
      ...emergencyContacts,
      ...sharedWith.contacts,
      ...sharedWith.guardians.map(g => ({ id: g.id, name: g.name, phone: g.phone })),
    ];

    // Simulate sending alerts
    allContacts.forEach((contact) => {
      // In real app, send SMS/push notification
      console.log(`Alerting ${contact.name} at ${contact.phone}`);
    });

    // Call emergency services
    window.location.href = "tel:197"; // Tunisia emergency number

    toast({
      title: t("walk.panic.activated"),
      description: t("walk.panic.activated.desc"),
      variant: "destructive",
    });

    // Log panic event
    const panicEvents = JSON.parse(localStorage.getItem("enazeda_panic_events") || "[]");
    panicEvents.push({
      id: Date.now().toString(),
      time: new Date().toISOString(),
      location: currentLocation,
      walkSession: walkSessionRef.current.id,
    });
    localStorage.setItem("enazeda_panic_events", JSON.stringify(panicEvents));
  };

  const handleEmergencyCall = () => {
    window.location.href = "tel:197"; // Tunisia emergency number
    toast({
      title: t("walk.emergency.calling"),
      description: t("walk.emergency.calling.desc"),
    });
  };

  const startWalk = async () => {
    if (!selectedMode) {
      toast({
        title: "Error",
        description: "Please select a walk mode",
        variant: "destructive",
      });
      return;
    }

    // Get location if not available
    if (!currentLocation) {
      toast({
        title: "Getting location...",
        description: "Please wait while we get your location",
      });
      
      // Try to get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(loc);
            // Retry starting walk with location
            setTimeout(() => startWalkWithLocation(loc), 100);
          },
          () => {
            // Fallback to Tunis coordinates
            const loc = { lat: 36.8065, lng: 10.1815 };
            setCurrentLocation(loc);
            setTimeout(() => startWalkWithLocation(loc), 100);
          }
        );
      } else {
        // Fallback to Tunis coordinates
        const loc = { lat: 36.8065, lng: 10.1815 };
        setCurrentLocation(loc);
        setTimeout(() => startWalkWithLocation(loc), 100);
      }
      return;
    }

    startWalkWithLocation(currentLocation);
  };

  const startWalkWithLocation = async (location: { lat: number; lng: number }) => {

    // Get selected contacts and guardians
    const contacts = emergencyContacts.filter(c => selectedContacts.includes(c.id));
    const guardians = trustedGuardians.filter(g => selectedGuardians.includes(g.id));

    if (contacts.length === 0 && guardians.length === 0 && selectedMode !== "safe-place") {
      toast({
        title: t("walk.no.contacts"),
        description: t("walk.no.contacts.desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      let sessionId: string;
      
      if (isAuthenticated) {
        // Start walk on backend
        const response = await api.startWalk({
          mode: selectedMode,
          location: location,
          contactIds: contacts.map(c => c.id),
          guardianIds: guardians.map(g => g.id),
        });
        sessionId = response.sessionId;
        setCurrentSessionId(sessionId);
      } else {
        sessionId = Date.now().toString();
      }

      setSharedWith({ contacts, guardians });
      setIsWalking(true);
      startTimeRef.current = new Date();
      
      // Create walk session
      const session: WalkSession = {
        id: sessionId,
        mode: selectedMode,
        startTime: startTimeRef.current,
        contacts,
        guardians,
        location: location,
        checkIns: [],
        panicEvents: [],
      };
      walkSessionRef.current = session;

      toast({
        title: t("walk.started"),
        description: t("walk.started.desc"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start walk",
        variant: "destructive",
      });
    }
  };

  const stopWalk = async () => {
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
    if (checkInIntervalRef.current) {
      clearInterval(checkInIntervalRef.current);
      checkInIntervalRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    // End walk on backend
    if (isAuthenticated && currentSessionId && walkSessionRef.current) {
      try {
        await api.endWalk(currentSessionId);
      } catch (error) {
        console.error("Failed to end walk:", error);
      }
    }

    // Save walk to localStorage for history (fallback)
    if (startTimeRef.current && selectedMode && walkSessionRef.current) {
      const walks = JSON.parse(localStorage.getItem("enazeda_walks") || "[]");
      const duration = formatTime(walkTime);
      const newWalk = {
        id: walkSessionRef.current.id,
        mode: selectedMode,
        startTime: startTimeRef.current.toISOString(),
        endTime: new Date().toISOString(),
        duration: duration,
        endLocation: currentLocation || "Current location",
        checkIns: walkSessionRef.current.checkIns.length,
        panicEvents: walkSessionRef.current.panicEvents.length,
      };
      walks.push(newWalk);
      localStorage.setItem("enazeda_walks", JSON.stringify(walks));
    }

    setIsWalking(false);
    setWalkTime(0);
    setCheckInTimer(0);
    setSelectedMode(null);
    setSelectedContacts([]);
    setSelectedGuardians([]);
    setShowContactSelection(false);
    startTimeRef.current = null;
    walkSessionRef.current = null;
    setCurrentLocation(null);
    setCurrentSessionId(null);

    toast({
      title: t("walk.ended"),
      description: t("walk.ended.desc"),
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCheckInTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const modes = [
    {
      id: "friend" as WalkMode,
      title: t("walk.modes.friend"),
      description: t("walk.modes.friend.desc"),
      icon: Users,
    },
    {
      id: "guardian" as WalkMode,
      title: t("walk.modes.guardian"),
      description: t("walk.modes.guardian.desc"),
      icon: Shield,
    },
    {
      id: "safe-place" as WalkMode,
      title: t("walk.modes.safe_place"),
      description: t("walk.modes.safe_place.desc"),
      icon: MapPin,
    },
  ];

  if (isWalking) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs text-foreground/80 mb-1">{t("walk.walking")}</p>
            <h1 className="text-xl font-medium text-foreground">{t("walk.location_active")}</h1>
          </div>

          {/* Location Status */}
          {currentLocation && (
            <div className="border border-border/30 p-4 mb-4 bg-card rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-xs text-foreground/80">{t("walk.location_sharing")}</p>
              </div>
              <p className="text-xs text-foreground/60">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Shared With */}
          {(sharedWith.contacts.length > 0 || sharedWith.guardians.length > 0) && (
            <div className="border border-border/30 p-4 mb-4 bg-card rounded-lg">
              <p className="text-xs text-foreground/80 mb-2">{t("walk.shared_with")}</p>
              <div className="space-y-1">
                {sharedWith.contacts.map((contact) => (
                  <p key={contact.id} className="text-xs text-foreground/70">
                    {contact.name}
                  </p>
                ))}
                {sharedWith.guardians.map((guardian) => (
                  <p key={guardian.id} className="text-xs text-foreground/70">
                    {guardian.name}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="border border-border/30 p-8 text-center mb-4 bg-card rounded-lg">
            <p className="text-xs text-foreground/80 mb-2">{t("walk.duration")}</p>
            <p className="text-4xl font-light tracking-tight font-mono">
              {formatTime(walkTime)}
            </p>
          </div>

          {/* Check-in Timer */}
          <div className="border border-border/30 p-4 mb-4 bg-card rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-foreground/60" />
                <p className="text-xs text-foreground/80">{t("walk.checkin.next")}</p>
              </div>
              <p className="text-sm font-mono text-foreground">
                {formatCheckInTime(300 - checkInTimer)}
              </p>
            </div>
          </div>

          {/* Panic Button */}
          <Button
            variant="destructive"
            size="lg"
            className="w-full mb-4 h-16 text-lg font-semibold"
            onClick={handlePanic}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {t("walk.panic.button")}
          </Button>
          <p className="text-center text-xs text-foreground/80 mb-6">
            {t("walk.panic.desc")}
          </p>

          {/* Emergency Call */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-4"
            onClick={handleEmergencyCall}
          >
            <Phone className="w-4 h-4 mr-2" />
            {t("walk.emergency.call")}
          </Button>

          {/* End Walk */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={stopWalk}
          >
            {t("walk.end")}
          </Button>
        </div>
      </div>
    );
  }

  if (showContactSelection && selectedMode) {
    const availableContacts = selectedMode === "guardian" 
      ? trustedGuardians 
      : emergencyContacts;
    const availableGuardians = selectedMode === "friend" 
      ? trustedGuardians 
      : [];

    return (
      <div className="min-h-screen p-4 pt-8 pb-24">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <p className="text-xs text-foreground/80 mb-1">{t("walk.select_contacts")}</p>
            <h1 className="text-xl font-medium text-foreground">
              {t(`walk.modes.${selectedMode === "friend" ? "friend" : selectedMode === "guardian" ? "guardian" : "safe_place"}`)}
            </h1>
          </div>

          {availableContacts.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-foreground/80 mb-3">
                {selectedMode === "guardian" ? t("walk.select_guardians") : t("walk.select_contacts_list")}
              </p>
              <div className="space-y-2">
                {availableContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      if (selectedMode === "guardian") {
                        setSelectedGuardians((prev) =>
                          prev.includes(contact.id)
                            ? prev.filter((id) => id !== contact.id)
                            : [...prev, contact.id]
                        );
                      } else {
                        setSelectedContacts((prev) =>
                          prev.includes(contact.id)
                            ? prev.filter((id) => id !== contact.id)
                            : [...prev, contact.id]
                        );
                      }
                    }}
                    className={`w-full text-left p-4 border transition-colors ${
                      (selectedMode === "guardian" 
                        ? selectedGuardians.includes(contact.id)
                        : selectedContacts.includes(contact.id))
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-foreground/50 bg-card"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-foreground/80">{contact.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableGuardians.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-foreground/80 mb-3">{t("walk.select_guardians")}</p>
              <div className="space-y-2">
                {availableGuardians.map((guardian) => (
                  <button
                    key={guardian.id}
                    onClick={() => {
                      setSelectedGuardians((prev) =>
                        prev.includes(guardian.id)
                          ? prev.filter((id) => id !== guardian.id)
                          : [...prev, guardian.id]
                      );
                    }}
                    className={`w-full text-left p-4 border transition-colors ${
                      selectedGuardians.includes(guardian.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-foreground/50 bg-card"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{guardian.name}</p>
                    <p className="text-xs text-foreground/80">{guardian.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(availableContacts.length === 0 && availableGuardians.length === 0) && (
            <div className="border border-border/30 p-8 bg-card rounded-lg text-center mb-6">
              <Users className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
              <p className="text-sm text-foreground/80 mb-2">
                {t("walk.no_contacts_available")}
              </p>
              <p className="text-xs text-foreground/60">
                {t("walk.add_contacts_first")}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => {
                setShowContactSelection(false);
                setSelectedContacts([]);
                setSelectedGuardians([]);
              }}
            >
              {t("walk.back")}
            </Button>
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={startWalk}
              disabled={
                selectedMode === "safe-place" 
                  ? false 
                  : selectedContacts.length === 0 && selectedGuardians.length === 0
              }
            >
              {t("walk.start")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-xs text-foreground/80 mb-1">{t("walk.title")}</p>
          <h1 className="text-xl font-medium text-foreground">{t("walk.choose")}</h1>
        </div>

        <div className="space-y-2 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id);
                  if (mode.id === "safe-place") {
                    // Safe place doesn't need contact selection
                    startWalk();
                  } else {
                    setShowContactSelection(true);
                  }
                }}
                className={`w-full text-left p-4 border transition-colors ${
                  selectedMode === mode.id
                    ? "border-foreground bg-secondary"
                    : "border-border/30 hover:border-foreground/50 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-foreground/70" />
                  <div>
                    <p className="text-sm font-medium mb-0.5 text-foreground">{mode.title}</p>
                    <p className="text-xs text-foreground/80">{mode.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border border-border/30 p-4 mb-8 bg-card rounded-lg">
          <p className="text-xs text-foreground/80 mb-3">{t("walk.features.title")}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
            <span>{t("walk.features.live_location")}</span>
            <span>{t("walk.features.checkin_timer")}</span>
            <span>{t("walk.features.panic_button")}</span>
            <span>{t("walk.features.emergency_call")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkWithMe;
