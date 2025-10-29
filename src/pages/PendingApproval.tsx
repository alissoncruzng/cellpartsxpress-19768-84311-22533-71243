import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
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
          <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Conta em Análise</CardTitle>
          <CardDescription>
            Sua conta está aguardando aprovação do administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              Obrigado por se cadastrar! Nossa equipe está analisando suas informações
              e você receberá uma notificação assim que sua conta for aprovada.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Tempo estimado: 24-48 horas</span>
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
