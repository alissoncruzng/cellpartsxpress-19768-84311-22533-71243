import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface RatingDialogProps {
  orderId: string;
  driverId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function RatingDialog({ orderId, driverId, onClose, onComplete }: RatingDialogProps) {
  const [driverRating, setDriverRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [appRating, setAppRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (driverRating === 0 || deliveryRating === 0 || appRating === 0) {
      toast.error("Por favor, avalie todos os itens");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ratings")
        .insert({
          order_id: orderId,
          driver_id: driverId,
          client_id: user.id,
          driver_rating: driverRating,
          delivery_rating: deliveryRating,
          app_rating: appRating,
          comment: comment || null,
        });

      if (error) throw error;

      onComplete();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avalie sua Experiência</DialogTitle>
          <DialogDescription>
            Sua opinião nos ajuda a melhorar nosso serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            value={driverRating}
            onChange={setDriverRating}
            label="Como foi o motorista?"
          />

          <StarRating
            value={deliveryRating}
            onChange={setDeliveryRating}
            label="Como foi a entrega?"
          />

          <StarRating
            value={appRating}
            onChange={setAppRating}
            label="Como foi o aplicativo?"
          />

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (Opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Deixe seu comentário aqui..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
