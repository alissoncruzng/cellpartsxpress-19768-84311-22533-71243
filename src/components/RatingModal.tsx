// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import backgroundPattern from "@/assets/background-pattern.jpeg";

interface RatingModalProps {
  orderId: string;
  driverId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" },
  { primary: "84 95% 55%", glow: "84 100% 45%" },
  { primary: "84 90% 65%", glow: "84 100% 55%" },
  { primary: "84 85% 58%", glow: "84 95% 48%" },
];

export default function RatingModal({ orderId, driverId, isOpen, onClose, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentColorIndex] = useState(0);

  const currentColor = roleColors[currentColorIndex];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("ratings")
        .insert({
          order_id: orderId,
          driver_id: driverId,
          client_id: user.id,
          score: rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast.success("Avaliação enviada com sucesso!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${backgroundPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Efeito radial dinâmico */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{
              background: `radial-gradient(circle at 50% 50%, hsl(${currentColor.glow} / 0.15), transparent 60%)`,
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl transition-all duration-300"
                 style={{
                   boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.3)`,
                 }}>
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-2 transition-all duration-1000"
                  style={{
                    color: `hsl(${currentColor.primary})`,
                    textShadow: `0 0 20px hsl(${currentColor.glow} / 0.6)`,
                  }}
                >
                  Avaliar Entrega
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80"
                >
                  Como foi sua experiência com o motorista?
                </motion.p>
              </div>

              <div className="space-y-6">
                {/* Rating Stars */}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors duration-200 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>

                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-white/80"
                  >
                    {rating === 1 && "Muito ruim"}
                    {rating === 2 && "Ruim"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bom"}
                    {rating === 5 && "Excelente"}
                  </motion.p>
                )}

                {/* Comment */}
                <div className="space-y-2">
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 text-white/50 h-5 w-5" />
                    <Textarea
                      placeholder="Deixe um comentário (opcional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 min-h-[80px] resize-none"
                      maxLength={500}
                    />
                  </div>
                  <p className="text-xs text-white/50 text-right">
                    {comment.length}/500 caracteres
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="flex-1 font-semibold transition-all duration-300 hover:scale-105 py-3"
                    style={{
                      background: `hsl(${currentColor.primary})`,
                      color: "hsl(0 0% 0%)",
                      boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.5)`,
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Avaliação"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
