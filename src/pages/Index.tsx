/**
 * Página Principal - ACR Delivery System
 *
 * Melhorias implementadas:
 * - Layout moderno com cards lado a lado
 * - Paleta de cores neon dinâmica (4 variações)
 * - Efeitos hover aprimorados com translateY
 * - Ícone de admin discreto no canto superior direito
 * - Design responsivo mobile-first
 * - Animações suaves e performáticas
 *
 * Cards disponíveis:
 * - Cliente: Acompanhamento de pedidos em tempo real
 * - Lojista: Condições especiais e preços diferenciados
 * - Motoboy: Gerenciamento de rotas e aumento de renda
 * - Admin: Acesso administrativo (ícone no canto)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Shield, Download, ArrowLeft, Store, Bike } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import backgroundPattern from "@/assets/background-pattern.jpeg";
import acrLogo from "@/assets/acr-logo-new.jpeg";

// Paleta de Cores Dinâmica - 4 variações de verde neon lime conforme especificações
const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" }, // Neon Lime Principal
  { primary: "84 95% 55%", glow: "84 100% 45%" },   // Lime variant 1
  { primary: "84 90% 65%", glow: "84 100% 55%" },  // Lime variant 2
  { primary: "84 85% 58%", glow: "84 95% 48%" },   // Lime variant 3
];

export default function Index() {
  const navigate = useNavigate();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const { isInstallable, isInstalled } = usePWAInstall();
  const [selectedRole, setSelectedRole] = useState<"client" | "wholesale" | "driver" | "admin" | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [loading, setLoading] = useState(true); // Começar com loading true
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simular carregamento mínimo para reduzir pisca
    const timer = setTimeout(() => {
      setLoading(false);
      setMounted(true);
    }, 500);

    // Change colors every 3 seconds
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % roleColors.length);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Loading state melhorado
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-green-400 text-lg font-medium">Carregando ACR Delivery...</p>
        </div>
      </div>
    );
  }

  const currentColor = roleColors[currentColorIndex];

  const roles = [
    {
      id: "client" as const,
      title: "Cliente",
      description: "Faça pedidos, acompanhe entregas em tempo real",
      icon: User,
    },
    {
      id: "wholesale" as const,
      title: "Lojista",
      description: "Condições especiais e preços diferenciados",
      icon: Store,
    },
    {
      id: "driver" as const,
      title: "Entregador",
      description: "Gerencie rotas e aumente sua renda",
      icon: Bike,
    },
  ];

  const handleAuthSuccess = () => {
    if (selectedRole === "driver") {
      navigate("/driver/dashboard");
    } else if (selectedRole === "admin") {
      navigate("/admin/dashboard");
    } else if (selectedRole === "wholesale") {
      navigate("/wholesale/dashboard");
    } else {
      navigate("/catalog");
    }
  };

  // If a role is selected, show the auth form
  if (selectedRole) {
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
        <div className="w-full max-w-md space-y-4 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
            className="mb-4 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Voltar
          </Button>

          <AuthForm
            mode={authMode}
            role={selectedRole}
            onSuccess={handleAuthSuccess}
          />

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
              className="text-white hover:text-white/80"
            >
              {authMode === "signin"
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Entre"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Efeito radial dinâmico com opacidade 15% */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${currentColor.glow} / 0.15), transparent 60%)`,
        }}
      />

      <div className="w-full max-w-6xl space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src={acrLogo}
              alt="ACR Logo"
              className="h-16 w-auto drop-shadow-2xl animate-fade-in"
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
          <p className="text-xl text-white/70">
            Selecione seu perfil: Cliente, Lojista ou Entregador
          </p>

          {/* Install Button */}
          {(isInstallable || !isInstalled) && (
            <Button
              onClick={() => navigate("/install-pwa")}
              variant="outline"
              className="mt-4 gap-2 border-2 transition-all duration-300 hover:scale-105 hover-neon"
              style={{
                borderColor: `hsl(${currentColor.primary} / 0.5)`,
                color: `hsl(${currentColor.primary})`,
                boxShadow: `0 0 15px hsl(${currentColor.glow} / 0.3)`,
              }}
            >
              <Download className="w-4 h-4" />
              Instalar App
            </Button>
          )}
        </div>

        {/* Role Selection Cards - Layout Simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
          {/* Card Cliente */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl animate-fade-in"
            style={{
              borderColor: `hsl(${currentColor.primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.2)`,
              animationDelay: `0ms`,
            }}
            onClick={() => setSelectedRole("client")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${currentColor.primary} / 0.2), hsl(${currentColor.glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.3)`,
                }}
              >
                <User
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                >
                  Cliente
                </h3>
                <p className="text-white/70">Faça pedidos e acompanhe entregas</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${currentColor.primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.7)`,
                  border: `2px solid hsl(${currentColor.primary} / 0.5)`,
                }}
              >
                Acessar como Cliente
              </Button>
            </CardContent>
          </Card>

          {/* Card Motoboy/Entregador */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl animate-fade-in"
            style={{
              borderColor: `hsl(${currentColor.primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.2)`,
              animationDelay: `150ms`,
            }}
            onClick={() => setSelectedRole("driver")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${currentColor.primary} / 0.2), hsl(${currentColor.glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.3)`,
                }}
              >
                <Bike
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                >
                  Motoboy
                </h3>
                <p className="text-white/70">Gerencie entregas e aumente sua renda</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${currentColor.primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.7)`,
                  border: `2px solid hsl(${currentColor.primary} / 0.5)`,
                }}
              >
                Acessar como Motoboy
              </Button>
            </CardContent>
          </Card>

          {/* Card Lojista */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl animate-fade-in"
            style={{
              borderColor: `hsl(${currentColor.primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.2)`,
              animationDelay: `300ms`,
            }}
            onClick={() => setSelectedRole("wholesale")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${currentColor.primary} / 0.2), hsl(${currentColor.glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.3)`,
                }}
              >
                <Store
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${currentColor.primary})` }}
                >
                  Lojista
                </h3>
                <p className="text-white/70">Gerencie produtos e pedidos especiais</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${currentColor.primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${currentColor.glow} / 0.7)`,
                  border: `2px solid hsl(${currentColor.primary} / 0.5)`,
                }}
              >
                Acessar como Lojista
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-white/50 animate-fade-in">
          <p>Sistema de gestão completo para entregas e vendas • ACR Delivery 2025</p>
        </div>
      </div>
    </div>
  );
}
