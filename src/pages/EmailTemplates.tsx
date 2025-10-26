import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Settings, Send, Eye, Code, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const emailTemplates = {
  otp: {
    name: "Código de Verificação OTP",
    description: "Template para envio do código de verificação por e-mail",
    subject: "Seu código de verificação ACR - {{code}}",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu código de verificação</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ACR Delivery</h1>
      <p>Verificação de Segurança</p>
    </div>
    <div class="content">
      <h2>Olá {{full_name}}!</h2>
      <p>Para completar seu cadastro na plataforma ACR, use o código de verificação abaixo:</p>
      <div class="code">{{code}}</div>
      <p><strong>Este código expira em 10 minutos.</strong></p>
      <p>Se você não solicitou este código, ignore este e-mail.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{redirect_url}}" class="button">Voltar ao App</a>
      </div>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático, por favor não responda.</p>
      <p>ACR Delivery - Plataforma de Entregas</p>
    </div>
  </div>
</body>
</html>`,
    text: `Olá {{full_name}}!

Para completar seu cadastro na plataforma ACR, use o código de verificação abaixo:

{{code}}

Este código expira em 10 minutos.

Se você não solicitou este código, ignore este e-mail.

Acesse: {{redirect_url}}

ACR Delivery - Plataforma de Entregas`
  },
  welcome: {
    name: "Boas-vindas",
    description: "E-mail de boas-vindas para novos usuários",
    subject: "Bem-vindo à ACR Delivery!",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à ACR</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .welcome-icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ACR Delivery</h1>
      <p>Seja bem-vindo!</p>
    </div>
    <div class="content">
      <div class="welcome-icon">🎉</div>
      <h2>Olá {{full_name}}!</h2>
      <p>Seu cadastro foi aprovado com sucesso! Agora você faz parte da plataforma ACR Delivery.</p>

      <h3>Como {{role_label}} você pode:</h3>
      <ul>
        {{role_features}}
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{redirect_url}}" class="button">Acessar Plataforma</a>
      </div>

      <p>Em caso de dúvidas, entre em contato conosco.</p>
    </div>
    <div class="footer">
      <p>ACR Delivery - Conectando pessoas e oportunidades</p>
    </div>
  </div>
</body>
</html>`,
    text: `Olá {{full_name}}!

Seu cadastro foi aprovado com sucesso! Agora você faz parte da plataforma ACR Delivery.

Como {{role_label}} você pode:
{{role_features}}

Acesse a plataforma: {{redirect_url}}

Em caso de dúvidas, entre em contato conosco.

ACR Delivery - Conectando pessoas e oportunidades`
  }
};

export default function EmailTemplates() {
  const [activeTemplate, setActiveTemplate] = useState("otp");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testTemplate = async (template: string) => {
    // TODO: Implementar teste de envio
    console.log("Testando template:", template);
  };

  const getRoleFeatures = (role: string) => {
    switch (role) {
      case "driver":
        return [
          "• Gerenciar rotas de entrega",
          "• Acompanhar pedidos em tempo real",
          "• Aumentar sua renda com mais entregas",
          "• Avaliar clientes e estabelecimentos"
        ].join("\n");
      case "wholesale":
        return [
          "• Condições especiais e preços diferenciados",
          "• Catálogo completo de produtos",
          "• Entregas prioritárias",
          "• Suporte dedicado"
        ].join("\n");
      case "client":
        return [
          "• Fazer pedidos com facilidade",
          "• Acompanhar entregas em tempo real",
          "• Histórico completo de pedidos",
          "• Suporte ao cliente 24/7"
        ].join("\n");
      default:
        return "• Acesso completo à plataforma";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-purple-400" />
            Templates de E-mail
          </h1>
          <p className="text-white/70">Configure os templates de e-mail para OTP e comunicações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Templates Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(emailTemplates).map(([key, template]) => (
                  <Button
                    key={key}
                    onClick={() => setActiveTemplate(key)}
                    variant={activeTemplate === key ? "default" : "outline"}
                    className={`w-full justify-start ${
                      activeTemplate === key
                        ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                        : "border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs opacity-70">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{emailTemplates[activeTemplate as keyof typeof emailTemplates].name}</CardTitle>
                    <CardDescription className="text-white/70">
                      {emailTemplates[activeTemplate as keyof typeof emailTemplates].description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => testTemplate(activeTemplate)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Testar
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(emailTemplates[activeTemplate as keyof typeof emailTemplates].html)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html" className="space-y-4">
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="html" className="text-white data-[state=active]:bg-purple-500/20">
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-white data-[state=active]:bg-purple-500/20">
                      Texto
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-white data-[state=active]:bg-purple-500/20">
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        <Code className="h-3 w-3 mr-1" />
                        HTML Template
                      </Badge>
                    </div>
                    <Textarea
                      value={emailTemplates[activeTemplate as keyof typeof emailTemplates].html}
                      className="min-h-[400px] bg-white/5 border-white/20 text-white font-mono text-sm"
                      readOnly
                    />
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-green-500/30 text-green-300">
                        Texto Simples
                      </Badge>
                    </div>
                    <Textarea
                      value={emailTemplates[activeTemplate as keyof typeof emailTemplates].text}
                      className="min-h-[400px] bg-white/5 border-white/20 text-white font-mono text-sm"
                      readOnly
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Badge>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <div className="text-white/70 text-sm mb-2">Assunto:</div>
                      <div className="text-white mb-4 p-2 bg-white/5 rounded">
                        {emailTemplates[activeTemplate as keyof typeof emailTemplates].subject}
                      </div>
                      <div className="text-white/70 text-sm mb-2">Conteúdo:</div>
                      <div className="text-white text-sm whitespace-pre-wrap">
                        {emailTemplates[activeTemplate as keyof typeof emailTemplates].text}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Como Configurar no Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/70">
            <div>
              <h4 className="text-white font-medium mb-2">1. Acesse o Painel Supabase</h4>
              <p>Entre no seu projeto Supabase e vá para Authentication → Email Templates</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">2. Configure o Template OTP</h4>
              <p>Selecione "Confirm signup" e cole o template HTML acima</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">3. Variáveis Disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded">
                  <div className="font-mono text-green-300">code</div>
                  <div className="text-sm">Código de verificação</div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="font-mono text-green-300">full_name</div>
                  <div className="text-sm">Nome do usuário</div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="font-mono text-green-300">redirect_url</div>
                  <div className="text-sm">URL de redirecionamento</div>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <div className="font-mono text-green-300">role_label</div>
                  <div className="text-sm">Tipo de usuário</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">📧 Dica Importante</h4>
              <p>Os templates de e-mail do Supabase são enviados automaticamente quando você chama <code className="text-green-300">signInWithOtp()</code> ou <code className="text-green-300">signUp()</code>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
