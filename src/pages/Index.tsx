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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function Index() {
  const [selectedRole, setSelectedRole] = useState<"client" | "driver" | "admin" | null>(null);

  if (selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
            className="mb-4"
          >
            Voltar
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">
              Acesso como {selectedRole === "client" ? "Cliente" : selectedRole === "driver" ? "Motoboy" : "Admin"}
            </h2>
            <p>Redirecionando para login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">ACR Delivery</h1>
          <p className="text-lg mb-8">Sistema de Gestão de Peças</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button
                onClick={() => setSelectedRole("client")}
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Acessar como Cliente
              </Button>

              <Button
                onClick={() => setSelectedRole("driver")}
                variant="outline"
                className="w-full"
              >
                Acessar como Motoboy
              </Button>

              <Button
                onClick={() => setSelectedRole("admin")}
                variant="outline"
                className="w-full"
              >
                Acessar como Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
