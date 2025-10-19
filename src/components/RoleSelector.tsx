import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Bike, Shield } from "lucide-react";
import acrLogo from "@/assets/acr-logo.png";

interface RoleSelectorProps {
  onSelectRole: (role: "client" | "driver" | "admin") => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background dark:from-background dark:to-card">
      <div className="w-full max-w-6xl space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <img 
            src={acrLogo} 
            alt="ACR Logo" 
            className="w-32 h-32 mx-auto object-contain drop-shadow-[0_0_20px_rgba(196,255,0,0.5)]"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sistema de Delivery ACR
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Gestão completa e rastreamento em tempo real
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(196,255,0,0.3)] border-2 hover:border-primary group bg-card/50 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-neon transition-all duration-300">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Cliente</CardTitle>
              <CardDescription className="text-base">
                Faça pedidos e acompanhe suas entregas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectRole("client")}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                Acessar como Cliente
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(125,245,220,0.3)] border-2 hover:border-secondary group bg-card/50 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 group-hover:shadow-[0_0_20px_rgba(125,245,220,0.5)] transition-all duration-300">
                <Bike className="w-10 h-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Motorista</CardTitle>
              <CardDescription className="text-base">
                Realize entregas e ganhe dinheiro com nossa plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectRole("driver")}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                size="lg"
              >
                Acessar como Motorista
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(77,156,255,0.3)] border-2 hover:border-accent group bg-card/50 backdrop-blur sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:shadow-[0_0_20px_rgba(77,156,255,0.5)] transition-all duration-300">
                <Shield className="w-10 h-10 text-accent" />
              </div>
              <CardTitle className="text-2xl">Administrador</CardTitle>
              <CardDescription className="text-base">
                Gerencie produtos, pedidos e monitore o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectRole("admin")}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
                size="lg"
              >
                Acessar como Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
