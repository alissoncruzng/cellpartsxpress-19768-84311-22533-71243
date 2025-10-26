import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RegistrationForm from "./RegistrationForm";
import backgroundPattern from "@/assets/background-pattern.jpeg";

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
  const [step, setStep] = useState<"email" | "code" | "register">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    // Change colors every 3 seconds
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % roleColors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentColor = roleColors[currentColorIndex];

  const sendOtp = async () => {
    if (!email) {
      setMessage("Por favor, digite seu e-mail");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 🎯 MODO DESENVOLVIMENTO: Bypass para evitar erro 429
      const isDevelopment = import.meta.env.DEV;

      if (isDevelopment) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 🎯 TEMPORÁRIO: Gerar código fixo para teste (desenvolvimento)
        const testCode = "123456";
        console.log("🎯 CÓDIGO DE TESTE:", testCode);
        console.log("📧 Email:", email);
        console.log("⚠️  Este é um código de teste para desenvolvimento!");
        console.log("💡 Para produção, configure SMTP no Supabase Dashboard");

        setStep("code");
        setMessage("Código enviado para seu e-mail (verifique o console do navegador - F12)");
        setMessageType("success");
        return;
      }

      // Modo produção - chamada real ao Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role }
        }
      });

      if (error) throw error;

      setStep("code");
      setMessage("Código enviado para seu e-mail");
      setMessageType("success");
    } catch (error: any) {
      setMessage(error.message || "Erro ao enviar código");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!code) {
      setMessage("Por favor, digite o código");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 🎯 MODO DESENVOLVIMENTO: Bypass para aceitar código de teste
      const isDevelopment = import.meta.env.DEV;

      if (isDevelopment && code === "123456") {
        // Simular delay de verificação
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simular criação de sessão para desenvolvimento
        const mockUser = {
          id: `dev-user-${Date.now()}`,
          email: email,
          user_metadata: { role: role },
          created_at: new Date().toISOString(),
        };

        // Armazenar informações do usuário logado no localStorage (simulação)
        localStorage.setItem('dev-session', JSON.stringify({
          user: mockUser,
          role: role,
          timestamp: Date.now()
        }));

        console.log("✅ Código de teste aceito!");
        console.log("🔐 Login simulado realizado com sucesso");
        console.log("👤 Usuário:", mockUser);

        setMessage("✅ Login realizado com sucesso!");
        setMessageType("success");
        setTimeout(() => onSuccess(), 1500);
        return;
      }

      // Modo produção - verificação real
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      if (error) throw error;

      // Verificar se é primeiro acesso (usuário novo)
      if (data.user?.user_metadata?.new_user) {
        setStep("register");
        setMessage("Complete seu cadastro");
        setMessageType("info");
      } else {
        setMessage("✅ Login realizado com sucesso!");
        setMessageType("success");
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error: any) {
      setMessage(error.message || "Código inválido");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL!,
        password: ADMIN_PASSWORD
      });

      if (error) throw error;

      setMessage("✅ Login de administrador realizado!");
      setMessageType("success");
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1500);
    } catch (error: any) {
      setMessage("Credenciais de administrador inválidas");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Se estiver na etapa de registro, mostrar o formulário de registro
  if (step === "register") {
    return <RegistrationForm userEmail={email} userRole={role} onSuccess={onSuccess} />;
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
              {role === "client" && "Acesse como cliente"}
              {role === "wholesale" && "Acesse como lojista"}
              {role === "driver" && "Acesse como motoboy"}
              {role === "admin" && "Painel administrativo"}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
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

                {role === "admin" && NORMALIZED_ADMIN_EMAIL && (
                  <p className="text-sm text-white/60">
                    Email de admin configurado: <span className="font-semibold">{ADMIN_EMAIL}</span>
                  </p>
                )}

                {role === "admin" ? (
                  <Button
                    onClick={handleAdminLogin}
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
                    onClick={sendOtp}
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
                        Enviando código...
                      </>
                    ) : (
                      "Enviar código"
                    )}
                  </Button>
                )}
              </motion.div>
            )}

            {step === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-white/80 mb-4">
                    Digite o código de 6 dígitos enviado para:
                  </p>
                  <p className="text-white font-medium">{email}</p>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep("email")}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={verifyOtp}
                    disabled={loading || code.length !== 6}
                    className="flex-1 font-semibold transition-all duration-300 hover:scale-105 py-3"
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
                      "Verificar código"
                    )}
                  </Button>
                </div>

                <Button
                  onClick={sendOtp}
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white hover:bg-white/5"
                >
                  Enviar novo código
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

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
