import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Truck, Shield, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import backgroundPattern from "@/assets/background-pattern.jpeg";
import acrLogo from "@/assets/acr-logo-new.jpeg";

const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" }, // Neon Lime
  { primary: "84 80% 55%", glow: "84 90% 45%" },   // Lime variant 1
  { primary: "84 90% 65%", glow: "84 100% 55%" },  // Lime variant 2
  { primary: "84 85% 58%", glow: "84 95% 48%" },   // Lime variant 3
];

export default function Index() {
  const navigate = useNavigate();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const { isInstallable, isInstalled } = usePWAInstall();

  useEffect(() => {
    // Change colors every 3 seconds
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % roleColors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentColor = roleColors[currentColorIndex];

  const roles = [
    {
      id: "client",
      title: "Cliente",
      description: "Faça seus pedidos e acompanhe entregas",
      icon: User,
      path: "/welcome?role=client",
    },
    {
      id: "driver",
      title: "Motorista",
      description: "Gerencie suas entregas e rotas",
      icon: Truck,
      path: "/welcome?role=driver",
    },
    {
      id: "admin",
      title: "Administrador",
      description: "Gerencie produtos e sistema",
      icon: Shield,
      path: "/welcome?role=admin",
    },
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Animated glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${currentColor.glow} / 0.15), transparent 60%)`,
        }}
      />

      <div className="w-full max-w-6xl space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center mb-6">
            <img
              src={acrLogo}
              alt="ACR Logo"
              className="h-24 w-auto drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 0 20px hsl(${currentColor.glow} / 0.6))`,
                transition: "filter 1s ease-in-out",
              }}
            />
          </div>
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
          
          {/* Install Button */}
          {(isInstallable || !isInstalled) && (
            <Button
              onClick={() => navigate("/install-pwa")}
              variant="outline"
              className="mt-4 gap-2 border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: `hsl(${currentColor.primary} / 0.5)`,
                color: `hsl(${currentColor.primary})`,
                boxShadow: `0 0 15px hsl(${currentColor.glow} / 0.3)`,
              }}
            >
              <Download className="w-5 h-5" />
              Instalar App
            </Button>
          )}
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
          {roles.map((role, index) => (
            <Card
              key={role.id}
              className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm"
              style={{
                borderColor: `hsl(${currentColor.primary} / 0.3)`,
                boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.2)`,
                animationDelay: `${index * 150}ms`,
              }}
              onClick={() => navigate(role.path)}
            >
              {/* Animated border glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, hsl(${currentColor.primary} / 0.2), transparent)`,
                }}
              />

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

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>Sistema de gestão completo para entregas e vendas</p>
        </div>
      </div>
    </div>
  );
}
