// @ts-nocheck - Types will be regenerated after migration
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Terms() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    loadPolicy();
    checkAcceptance();
  }, []);

  const loadPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("type", "terms")
        .eq("is_active", true)
        .order("effective_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setPolicy(data);
    } catch (error: any) {
      console.error("Error loading policy:", error);
      toast.error("Erro ao carregar termos");
    } finally {
      setLoading(false);
    }
  };

  const checkAcceptance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: policyData } = await supabase
        .from("policies")
        .select("id")
        .eq("type", "terms")
        .eq("is_active", true)
        .single();

      if (!policyData) return;

      const { data } = await supabase
        .from("policy_acceptances")
        .select("id")
        .eq("user_id", user.id)
        .eq("policy_id", policyData.id)
        .single();

      setHasAccepted(!!data);
    } catch (error: any) {
      console.error("Error checking acceptance:", error);
    }
  };

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("Você precisa aceitar os termos");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("policy_acceptances")
        .insert({
          user_id: user.id,
          policy_id: policy.id,
        });

      if (error) throw error;

      toast.success("Termos aceitos com sucesso!");
      navigate(-1);
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast.error("Erro ao aceitar termos");
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
              <FileText className="h-6 w-6" />
              {policy?.title || "Termos de Uso"}
            </CardTitle>
            {policy?.version && (
              <p className="text-sm text-muted-foreground">
                Versão {policy.version} - Vigente desde{" "}
                {new Date(policy.effective_date).toLocaleDateString("pt-BR")}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{policy?.content || ""}</ReactMarkdown>
            </div>

            {!hasAccepted && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accept"
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  />
                  <label
                    htmlFor="accept"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Li e aceito os Termos de Uso do ACR Delivery
                  </label>
                </div>

                <Button
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="w-full"
                >
                  Aceitar e Continuar
                </Button>
              </div>
            )}

            {hasAccepted && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Você já aceitou estes termos</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
