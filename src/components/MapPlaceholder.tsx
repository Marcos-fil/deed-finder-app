import { MapPin, Navigation, Clock, Phone, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const ONG_LOCATION = {
  name: "Missão Vida",
  address: "R. Jaci, 314 - Cidade Ariston Estela Azevedo, Carapicuíba - SP, 06396-190",
  hours: "Seg a Sex, 09:00 - 17:00",
  phone: "+55 11 94128-9195",
  lat: -23.5245,
  lng: -46.8355,
  accepts: ["Roupas", "Alimentos", "Cobertores", "Calçados", "Higiene"],
  googleMapsUrl: "https://maps.app.goo.gl/Cm6VyPve2Jy6w6ym9",
};

const MapPlaceholder = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      (err) => {
        setLocationError("Não foi possível obter sua localização.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const getDirectionsUrl = () => {
    const destination = `${ONG_LOCATION.lat},${ONG_LOCATION.lng}`;
    if (userLocation) {
      return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination}`;
    }
    return `https://www.google.com/maps/dir//${destination}`;
  };

  const getEmbedUrl = () => {
    if (userLocation) {
      return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${userLocation.lat},${userLocation.lng}&destination=${ONG_LOCATION.lat},${ONG_LOCATION.lng}&mode=driving`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${ONG_LOCATION.lat},${ONG_LOCATION.lng}&zoom=15`;
  };

  return (
    <div className="space-y-4">
      {/* Map embed */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: "300px" }}>
        <iframe
          src={getEmbedUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa - Missão Vida"
        />
      </div>

      {/* Location status */}
      {loadingLocation && (
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <p className="text-sm text-muted-foreground animate-pulse">📍 Obtendo sua localização...</p>
        </div>
      )}
      {locationError && (
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <p className="text-sm text-destructive">{locationError}</p>
          <button onClick={requestLocation} className="text-xs text-primary font-medium mt-1 underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Directions button */}
      <Button className="w-full h-12" size="lg" asChild>
        <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
          <Navigation className="h-5 w-5 mr-2" />
          Abrir rota no Google Maps
          <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </Button>

      {/* ONG Card */}
      <div className="bg-card rounded-xl p-4 border border-border animate-fade-in-up">
        <div className="flex items-start gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{ONG_LOCATION.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{ONG_LOCATION.address}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground ml-12">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {ONG_LOCATION.hours}
          </span>
          <a href={`tel:${ONG_LOCATION.phone}`} className="flex items-center gap-1 text-primary">
            <Phone className="h-3 w-3" /> {ONG_LOCATION.phone}
          </a>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-12">
          {ONG_LOCATION.accepts.map((item) => (
            <span key={item} className="text-[0.65rem] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
