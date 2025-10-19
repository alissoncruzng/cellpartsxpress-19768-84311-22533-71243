import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Share, Home, CheckCircle2, Chrome, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function InstallPWA() {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall, isIOS, isIOSSafari, canPrompt } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstall = async () => {
    if (isIOS && isIOSSafari) {
      setShowIOSInstructions(true);
      return;
    }

    if (canPrompt) {
      const accepted = await promptInstall();
      if (accepted) {
        toast.success("App instalado com sucesso!");
        setTimeout(() => navigate("/"), 2000);
      }
    } else {
      toast.info("Use o menu do seu navegador para instalar o app");
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">App Instalado!</CardTitle>
            <CardDescription>
              O ACR Delivery já está instalado no seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Ir para o Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Instalar ACR Delivery</CardTitle>
          <CardDescription>
            Instale nosso app para uma experiência melhor, mais rápida e com acesso offline
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!showIOSInstructions ? (
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong className="block mb-1">Acesso Rápido</strong>
                    <span className="text-muted-foreground">Abra direto da tela inicial do seu celular</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong className="block mb-1">Funciona Offline</strong>
                    <span className="text-muted-foreground">Use mesmo sem internet</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong className="block mb-1">Notificações</strong>
                    <span className="text-muted-foreground">Receba atualizações em tempo real</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleInstall} 
                className="w-full" 
                size="lg"
                disabled={!isInstallable && !isIOS}
              >
                <Download className="mr-2 h-5 w-5" />
                {isIOS ? "Ver Instruções de Instalação" : "Instalar Agora"}
              </Button>

              {!isInstallable && !isIOS && (
                <p className="text-sm text-center text-muted-foreground">
                  Use o menu do navegador (⋮) e selecione "Adicionar à tela inicial"
                </p>
              )}

              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="w-full"
              >
                Continuar no Navegador
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Apple className="h-5 w-5" />
                  <span className="font-semibold">Instruções para iOS/Safari</span>
                </div>
                
                <ol className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium mb-1">Toque no botão Compartilhar</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Share className="h-4 w-4" />
                        <span className="text-xs">(ícone na parte inferior da tela)</span>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium mb-1">Role e toque em "Adicionar à Tela de Início"</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Home className="h-4 w-4" />
                        <span className="text-xs">Procure este ícone</span>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-medium mb-1">Confirme tocando em "Adicionar"</p>
                      <p className="text-xs text-muted-foreground">O app aparecerá na sua tela inicial</p>
                    </div>
                  </li>
                </ol>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-center">
                    <strong className="text-primary">Dica:</strong> Após instalar, abra o app pela tela inicial para a melhor experiência
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowIOSInstructions(false)} 
                  className="w-full"
                >
                  Voltar
                </Button>
                
                <Button 
                  onClick={() => navigate("/")} 
                  className="w-full"
                >
                  Entendi, Ir para o App
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
