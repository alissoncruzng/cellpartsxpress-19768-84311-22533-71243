// @ts-nocheck - Types will be regenerated after migration
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, MapPin, Star, Package, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ClientInfoProps {
  clientId: string;
  orderId: string;
}

interface ClientProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
}

interface ClientStats {
  total_orders: number;
  average_rating: number;
}

export default function ClientInfo({ clientId, orderId }: ClientInfoProps) {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<ClientStats>({ total_orders: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientInfo();
  }, [clientId]);

  const loadClientInfo = async () => {
    try {
      // Load client profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load client stats
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("client_id", clientId);

      if (ordersError) throw ordersError;

      // Load client ratings given by drivers
      const { data: ratingsData } = await supabase
        .from("driver_ratings")
        .select("rating")
        .eq("client_id", clientId);

      const avgRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
        : 0;

      setStats({
        total_orders: ordersData?.length || 0,
        average_rating: avgRating,
      });
    } catch (error: any) {
      console.error("Error loading client info:", error);
      toast.error("Erro ao carregar informações do cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleCallClient = () => {
    if (profile?.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (profile?.phone) {
      const message = encodeURIComponent(
        `Olá! Sou o motorista responsável pela entrega do seu pedido. Estou a caminho!`
      );
      const phoneNumber = profile.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phoneNumber}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Profile */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.full_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{stats.total_orders} pedidos</span>
              {stats.average_rating > 0 && (
                <>
                  <span>•</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{stats.average_rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {profile.phone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
            
            {/* Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallClient}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Ligar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        {/* Client Badge */}
        {stats.total_orders >= 50 && (
          <Badge variant="secondary" className="w-full justify-center">
            🏆 Cliente VIP ({stats.total_orders}+ pedidos)
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
