import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Bike, Shield, ArrowLeft } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"client" | "driver" | "admin" | null>(null);
  const [currentColor, setCurrentColor] = useState(0);

  const colors = [
    { primary: "84 100% 60%", glow: "84 100% 50%" }, // Neon Lime
    { primary: "84 95% 55%", glow: "84 100% 45%" },   // Lime variant
    { primary: "84 90% 65%", glow: "84 100% 55%" },  // Lime variant
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor((prev) => (prev + 1) % colors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (role: "client" | "driver" | "admin") => {
    setSelectedRole(role);
    // Navigate to login with role parameter
    navigate(`/login?role=${role}`);
  };

  if (selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">
              Acesso como {selectedRole === "client" ? "Cliente" : selectedRole === "driver" ? "Motoboy" : "Admin"}
            </h2>
            <p>Redirecionando para autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effect */}
      <div
        className="absolute inset-0 opacity-20 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${colors[currentColor].glow} / 0.15), transparent 60%)`,
        }}
      />

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1
            className="text-5xl md:text-6xl font-bold transition-all duration-1000"
            style={{
              color: `hsl(${colors[currentColor].primary})`,
              textShadow: `0 0 40px hsl(${colors[currentColor].glow} / 0.6)`,
            }}
          >
            ACR Delivery System
          </h1>
          <p className="text-xl text-white/70">
            Selecione seu perfil para acessar o sistema
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Client Card */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl"
            style={{
              borderColor: `hsl(${colors[currentColor].primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${colors[currentColor].glow} / 0.2)`,
            }}
            onClick={() => handleRoleSelect("client")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${colors[currentColor].primary} / 0.2), hsl(${colors[currentColor].glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.3)`,
                }}
              >
                <User
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                >
                  Cliente
                </h3>
                <p className="text-white/70">Faça pedidos e acompanhe entregas</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${colors[currentColor].primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.7)`,
                }}
              >
                Acessar como Cliente
              </Button>
            </CardContent>
          </Card>

          {/* Driver Card */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl"
            style={{
              borderColor: `hsl(${colors[currentColor].primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${colors[currentColor].glow} / 0.2)`,
            }}
            onClick={() => handleRoleSelect("driver")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${colors[currentColor].primary} / 0.2), hsl(${colors[currentColor].glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.3)`,
                }}
              >
                <Bike
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                >
                  Motoboy
                </h3>
                <p className="text-white/70">Gerencie entregas e aumente sua renda</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${colors[currentColor].primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.7)`,
                }}
              >
                Acessar como Motoboy
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm hover:shadow-2xl"
            style={{
              borderColor: `hsl(${colors[currentColor].primary} / 0.3)`,
              boxShadow: `0 0 20px hsl(${colors[currentColor].glow} / 0.2)`,
            }}
            onClick={() => handleRoleSelect("admin")}
          >
            <CardContent className="pt-8 pb-6 space-y-6 relative">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, hsl(${colors[currentColor].primary} / 0.2), hsl(${colors[currentColor].glow} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.3)`,
                }}
              >
                <Shield
                  className="w-8 h-8 transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                />
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: `hsl(${colors[currentColor].primary})` }}
                >
                  Administrador
                </h3>
                <p className="text-white/70">Gerencie o sistema e usuários</p>
              </div>

              <Button
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-4 text-lg shadow-lg"
                style={{
                  background: `hsl(${colors[currentColor].primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 30px hsl(${colors[currentColor].glow} / 0.7)`,
                }}
              >
                Acessar como Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-white/50">
          <p>Sistema de gestão completo para entregas e vendas • ACR Delivery 2025</p>
        </div>
      </div>
    </div>
  );
}
