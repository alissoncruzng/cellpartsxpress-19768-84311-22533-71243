// @ts-nocheck - Types will be regenerated after migration
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuthFormProps {
  mode: "signin" | "signup";
  role?: "client" | "driver" | "admin";
  onSuccess?: () => void;
}

export default function AuthForm({ mode, role = "client", onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/catalog`,
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile
          // @ts-ignore - Types will be regenerated after migration
          const { error: profileError } = await supabase.from("profiles").insert(
            // @ts-ignore
            {
              id: data.user.id,
              full_name: fullName,
              phone,
            }
          );

          if (profileError) throw profileError;

          // Assign role in user_roles table
          // @ts-ignore - Types will be regenerated after migration
          const { error: roleError } = await supabase.from("user_roles").insert(
            // @ts-ignore
            {
              user_id: data.user.id,
              role: role,
            }
          );

          if (roleError) throw roleError;
        }

        const successMessage = role === "driver" 
          ? "Cadastro realizado! Aguarde aprovação do administrador." 
          : role === "admin"
          ? "Cadastro de administrador realizado com sucesso!"
          : "Cadastro realizado com sucesso!";
        
        toast.success(successMessage);
        
        // Wait a bit for session to be established before navigating
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Login realizado com sucesso!");
        
        // Wait a bit for session to be established before navigating
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === "signin" ? "Entrar" : "Cadastrar"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Entre com suas credenciais"
            : `Cadastre-se como ${
                role === "driver" ? "Motorista" : 
                role === "admin" ? "Administrador" : 
                "Cliente"
              }`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
