import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, AlertTriangle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AccountBlocked() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-700">Conta Bloqueada</CardTitle>
          <CardDescription>
            Sua conta foi temporariamente suspensa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              Sua conta foi bloqueada pelo administrador do sistema.
              Entre em contato conosco para resolver essa questão.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">Motivos comuns para bloqueio:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Violação dos termos de uso</li>
                  <li>Comportamento inadequado</li>
                  <li>Informações falsas no cadastro</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Mail className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">Entre em contato:</p>
                <p className="text-xs mt-1">admin@cellpartsxpress.com</p>
                <p className="text-xs">WhatsApp: (11) 4669-8650</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sair da Conta
            </Button>
            <Button onClick={() => navigate("/")} variant="ghost" className="w-full">
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
