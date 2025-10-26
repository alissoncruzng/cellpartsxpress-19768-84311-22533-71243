import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Truck, Shield, Download } from "lucide-react";

const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" },
  { primary: "84 80% 55%", glow: "84 90% 45%" },
  { primary: "84 90% 65%", glow: "84 100% 55%" },
  { primary: "84 85% 58%", glow: "84 95% 48%" },
];

export default function Index() {
  const [currentColorIndex, setCurrentColorIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % roleColors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentColor = roleColors[currentColorIndex];

  const roles = [
    {
      id: "client",
      title: "Cliente",
      description: "Faça seus pedidos e acompanhe entregas",
      icon: User,
    },
    {
      id: "driver",
      title: "Motorista",
      description: "Gerencie suas entregas e rotas",
      icon: Truck,
    },
    {
      id: "admin",
      title: "Administrador",
      description: "Gerencie produtos e sistema",
      icon: Shield,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-6xl space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1
            className="text-5xl md:text-6xl font-bold transition-all duration-1000"
            style={{
              color: `hsl(${currentColor.primary})`,
              textShadow: `0 0 40px hsl(${currentColor.glow} / 0.6), 0 0 20px hsl(${currentColor.glow} / 0.4)`,
            }}
          >
            ACR Delivery System
          </h1>
          <p className="text-xl text-muted-foreground">
            Selecione seu perfil de acesso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <Card
              key={role.id}
              className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm"
              style={{
                borderColor: `hsl(${currentColor.primary} / 0.3)`,
                boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.2)`,
              }}
            >
              <CardContent className="pt-8 pb-6 space-y-6 relative">
                <div
                  className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, hsl(${currentColor.primary} / 0.2), hsl(${currentColor.glow} / 0.1))`,
                    boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.3)`,
                  }}
                >
                  <role.icon
                    className="w-10 h-10 transition-colors duration-300"
                    style={{ color: `hsl(${currentColor.primary})` }}
                  />
                </div>

                <div className="text-center space-y-2">
                  <h3
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{ color: `hsl(${currentColor.primary})` }}
                  >
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground">{role.description}</p>
                </div>

                <Button
                  className="w-full font-semibold transition-all duration-300"
                  style={{
                    background: `hsl(${currentColor.primary})`,
                    color: "hsl(0 0% 0%)",
                    boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.5)`,
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Sistema de gestão completo para entregas e vendas</p>
        </div>
      </div>
    </div>
  );
}
