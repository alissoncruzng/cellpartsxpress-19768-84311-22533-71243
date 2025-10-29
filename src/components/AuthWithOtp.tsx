import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowLeft, Facebook, Chrome, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import backgroundPattern from "@/assets/background-pattern.jpeg";

// Extend window type for reCAPTCHA
declare global {
  interface Window {
    // recaptchaVerifier: RecaptchaVerifier; // Not needed with Supabase
  }
}

interface AuthWithOtpProps {
  role: "client" | "wholesale" | "driver" | "admin";
  onSuccess: () => void;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
  ? import.meta.env.VITE_ADMIN_EMAIL.trim().replace(/^['"]|['"]$/g, "")
  : undefined;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const NORMALIZED_ADMIN_EMAIL = ADMIN_EMAIL?.toLowerCase();

// Paleta de Cores Dinâmica - 4 variações de verde neon lime conforme especificações
const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" }, // Neon Lime Principal
  { primary: "84 95% 55%", glow: "84 100% 45%" },   // Lime variant 1
  { primary: "84 90% 65%", glow: "84 100% 55%" },  // Lime variant 2
  { primary: "84 85% 58%", glow: "84 95% 48%" },   // Lime variant 3
];

export default function AuthWithOtp({ role, onSuccess }: AuthWithOtpProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [isLogin, setIsLogin] = useState(true); // true = login, false = cadastro
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    // Change colors every 3 seconds
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % roleColors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentColor = roleColors[currentColorIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      toast.error("Sistema de autenticação não configurado. Contate o suporte.");
      return;
    }

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Login realizado com sucesso!");
        onSuccess();
      } else {
        // Cadastro direto sem confirmação
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              email_confirm: true, // Conta já confirmada
            },
          },
        });

        if (error) throw error;

        // Criar perfil automaticamente
        if (data.user) {
          try {
            // Primeiro verificar se o perfil já existe
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .single();

            // Só criar se não existir
            if (!existingProfile) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: email,
                  role: role,
                  is_approved: role === 'admin', // Admin aprovado automaticamente
                  is_blocked: false,
                  full_name: email.split('@')[0], // Nome temporário
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
                // Não falhar completamente se for erro de perfil duplicado
                if (!profileError.message?.includes('duplicate key')) {
                  toast.error("Conta criada, mas houve um problema no perfil. Contate o suporte.");
                }
              }
            }
          } catch (profileCheckError) {
            console.error('Erro ao verificar perfil existente:', profileCheckError);
          }
        }

        toast.success("Conta criada com sucesso! Você já pode fazer login.");
        setIsLogin(true); // Mudar para modo login
      }
    } catch (error: any) {
      console.error('Erro:', error);

      // Tratamento específico de erros
      if (error.message?.includes('Email not confirmed')) {
        toast.error("Email não confirmado. Verifique sua caixa de entrada ou tente se cadastrar novamente.");
        setIsLogin(false); // Mudar para modo cadastro
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error("Email ou senha incorretos. Verifique suas credenciais.");
      } else if (error.message?.includes('User already registered')) {
        toast.success("Usuário já cadastrado! Faça login com suas credenciais.");
        setIsLogin(true); // Mudar para modo login
      } else {
        toast.error(error.message || "Erro na autenticação");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setMessage("Sistema de autenticação não configurado. Contate o suporte.");
      setMessageType("error");
      return;
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      setMessage("Credenciais de administrador não configuradas. Contate o suporte.");
      setMessageType("error");
      return;
    }

    const normalizedInput = email.trim().toLowerCase();

    if (normalizedInput !== NORMALIZED_ADMIN_EMAIL) {
      setMessage("Email de administrador incorreto");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      if (error) throw error;
      setMessage("✅ Login de administrador realizado!");
      setMessageType("success");
      setTimeout(() => onSuccess(), 1500);
    } catch (error: any) {
      setMessage("Credenciais de administrador inválidas");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Se estiver na etapa de registro, mostrar o formulário de registro
  // if (step === "register") {
  //   return <RegistrationForm userPhone={phone} userRole={role} onSuccess={onSuccess} />;
  // }

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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl transition-all duration-300"
             style={{
               boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.3)`,
             }}>
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2 transition-all duration-1000"
              style={{
                color: `hsl(${currentColor.primary})`,
                textShadow: `0 0 40px hsl(${currentColor.glow} / 0.6), 0 0 20px hsl(${currentColor.glow} / 0.4)`,
              }}
            >
              {role === "admin" ? "Acesso Administrativo" : "Autenticação ACR"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80"
            >
              {isLogin ? "Faça login com seu email e senha" : "Crie sua conta"}
            </motion.p>
          </div>

          <form onSubmit={role === "admin" ? handleAdminLogin : handleSubmit} className="space-y-6">
            {/* Login Social */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => toast.info("Login com Gmail em breve!")}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continuar com Gmail
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-800 text-blue-800 hover:bg-blue-50"
                onClick={() => toast.info("Login com Facebook em breve!")}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Continuar com Facebook
              </Button>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/60">Ou</span>
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
            </div>

            {role === "admin" && ADMIN_EMAIL && (
              <p className="text-sm text-white/60">
                Admin: {ADMIN_EMAIL}
              </p>
            )}

            {role === "admin" ? (
              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-3"
                style={{
                  background: `hsl(${currentColor.primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.5)`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acessar como Administrador"
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold transition-all duration-300 hover:scale-105 py-3"
                style={{
                  background: `hsl(${currentColor.primary})`,
                  color: "hsl(0 0% 0%)",
                  boxShadow: `0 0 20px hsl(${currentColor.glow} / 0.5)`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  isLogin ? "Entrar" : "Criar Conta"
                )}
              </Button>
            )}

            {!loading && role !== "admin" && (
              <Button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                {isLogin ? "Não tenho conta - Criar conta" : "Já tenho conta - Fazer login"}
              </Button>
            )}
          </form>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-lg text-center ${
                  messageType === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : messageType === "error"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {messageType === "success" && <CheckCircle className="h-4 w-4" />}
                  {messageType === "error" && <AlertCircle className="h-4 w-4" />}
                  {messageType === "info" && <Mail className="h-4 w-4" />}
                  <span className="text-sm">{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
