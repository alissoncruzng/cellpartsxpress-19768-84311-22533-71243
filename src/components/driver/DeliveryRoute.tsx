// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Clock, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DeliveryRouteProps {
  pickupAddress?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryCep: string;
}

export default function DeliveryRoute({
  pickupAddress,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  deliveryCep,
}: DeliveryRouteProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Não foi possível obter sua localização");
        }
      );
    }
  };

  const calculateRoute = async () => {
    if (!currentLocation) {
      toast.error("Aguardando localização...");
      return;
    }

    setLoading(true);
    try {
      const destination = `${deliveryAddress}, ${deliveryCity} - ${deliveryState}, ${deliveryCep}`;
      const origin = pickupAddress || `${currentLocation.lat},${currentLocation.lng}`;

      // Using Google Maps Directions API (requires API key)
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        // Fallback: Open Google Maps directly
        openGoogleMaps(origin, destination);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0].legs[0];
        setDistance(route.distance.text);
        setDuration(route.duration.text);
        toast.success("Rota calculada!");
      } else {
        throw new Error("Não foi possível calcular a rota");
      }
    } catch (error: any) {
      console.error("Error calculating route:", error);
      toast.error("Erro ao calcular rota. Abrindo Google Maps...");
      openGoogleMaps(
        pickupAddress || `${currentLocation?.lat},${currentLocation?.lng}`,
        `${deliveryAddress}, ${deliveryCity} - ${deliveryState}, ${deliveryCep}`
      );
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (origin: string, destination: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const openWaze = () => {
    const destination = `${deliveryAddress}, ${deliveryCity} - ${deliveryState}`;
    const url = `https://waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
    window.open(url, "_blank");
  };

  const startNavigation = () => {
    const destination = `${deliveryAddress}, ${deliveryCity} - ${deliveryState}, ${deliveryCep}`;
    const origin = pickupAddress || (currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : "");
    openGoogleMaps(origin, destination);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Rota de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pickup Address */}
        {pickupAddress && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-semibold">Ponto de Coleta</p>
                <p className="text-sm text-muted-foreground">{pickupAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-1" />
            <div>
              <p className="text-sm font-semibold">Endereço de Entrega</p>
              <p className="text-sm text-muted-foreground">
                {deliveryAddress}
              </p>
              <p className="text-sm text-muted-foreground">
                {deliveryCity} - {deliveryState}, {deliveryCep}
              </p>
            </div>
          </div>
        </div>

        {/* Route Info */}
        {(distance || duration) && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            {distance && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-semibold">{distance}</p>
                </div>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Est.</p>
                  <p className="font-semibold">{duration}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Location Status */}
        {currentLocation && (
          <Badge variant="outline" className="w-full justify-center gap-2">
            <MapPin className="h-3 w-3" />
            Localização obtida
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={calculateRoute}
            className="w-full gap-2"
            disabled={loading || !currentLocation}
          >
            <TrendingUp className="h-4 w-4" />
            {loading ? "Calculando..." : "Calcular Rota"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={startNavigation}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              Google Maps
            </Button>
            <Button
              variant="outline"
              onClick={openWaze}
              className="gap-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
            >
              <ExternalLink className="h-4 w-4" />
              Waze
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          Clique em "Calcular Rota" para ver distância e tempo estimado, ou abra diretamente no app de navegação.
        </p>
      </CardContent>
    </Card>
  );
}
