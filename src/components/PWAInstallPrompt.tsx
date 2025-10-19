import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { isInstallable, isInstalled, canPrompt } = usePWAInstall();
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar o prompt apenas se:
    // 1. O app é instalável
    // 2. Não está instalado
    // 3. O usuário não fechou o prompt antes (verificar localStorage)
    const promptDismissed = localStorage.getItem("pwa-install-dismissed");
    const shouldShow = isInstallable && !isInstalled && !promptDismissed;
    
    if (shouldShow) {
      // Mostrar após 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleInstall = () => {
    navigate("/install-pwa");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in-bottom md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary/20 bg-card/95 backdrop-blur-lg shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Instalar ACR Delivery</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Instale o app para acesso rápido e use offline!
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Instalar
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
