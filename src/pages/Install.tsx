import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Share, MoreVertical, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center animate-scale-in">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">App Instalado!</h1>
          <p className="text-muted-foreground mb-6">
            O Speedster já está instalado no seu dispositivo. Você pode acessá-lo pela sua tela inicial!
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Ir para o App
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Instale o Speedster</h1>
          <p className="text-muted-foreground">
            Acesse o app de forma rápida direto da sua tela inicial
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Acesso Instantâneo</h3>
              <p className="text-sm text-muted-foreground">
                Abra o app com um toque na tela inicial
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Funciona Offline</h3>
              <p className="text-sm text-muted-foreground">
                Continue usando mesmo sem internet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Notificações</h3>
              <p className="text-sm text-muted-foreground">
                Receba atualizações dos seus pedidos
              </p>
            </div>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Como instalar no iOS (Safari):
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Toque no botão <Share className="w-4 h-4 inline" /> (Compartilhar) na barra inferior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Role para baixo e toque em "Adicionar à Tela Inicial"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Toque em "Adicionar" no canto superior direito</span>
                </li>
              </ol>
            </div>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Voltar ao App
            </Button>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Instalar Agora
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Continuar no Navegador
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Como instalar no Android (Chrome):
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Toque no menu <MoreVertical className="w-4 h-4 inline" /> (três pontos) no canto superior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Toque em "Instalar app" ou "Adicionar à tela inicial"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Confirme tocando em "Instalar"</span>
                </li>
              </ol>
            </div>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Voltar ao App
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Install;
