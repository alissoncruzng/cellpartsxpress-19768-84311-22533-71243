// @ts-nocheck - Types will be regenerated after migration
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Privacy() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("type", "privacy")
        .eq("is_active", true)
        .order("effective_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setPolicy(data);
    } catch (error: any) {
      console.error("Error loading policy:", error);
      toast.error("Erro ao carregar política");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {policy?.title || "Política de Privacidade"}
            </CardTitle>
            {policy?.version && (
              <p className="text-sm text-muted-foreground">
                Versão {policy.version} - Vigente desde{" "}
                {new Date(policy.effective_date).toLocaleDateString("pt-BR")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{policy?.content || ""}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
