import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoleSelector from "@/components/RoleSelector";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Welcome() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleFromUrl = searchParams.get("role") as "client" | "driver" | "admin" | null;
  const [selectedRole, setSelectedRole] = useState<"client" | "driver" | "admin" | null>(roleFromUrl);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/catalog");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <>
        <RoleSelector onSelectRole={setSelectedRole} />
        <div className="fixed bottom-4 right-4">
          <Link to="/install">
            <Button variant="secondary" size="lg" className="shadow-lg">
              <Download className="mr-2 h-5 w-5" />
              Instalar App
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background dark:from-background dark:to-card">
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedRole(null)}
          className="mb-4 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <AuthForm
          mode={authMode}
          role={selectedRole}
          onSuccess={() => navigate("/catalog")}
        />

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
            className="text-primary hover:text-primary/80"
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
