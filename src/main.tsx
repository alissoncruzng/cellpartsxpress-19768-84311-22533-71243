import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

declare global {
  interface Window {
    __reactRouterEnableFuture?: {
      v7_startTransition?: boolean;
      v7_relativeSplatPath?: boolean;
    };
  }
}

// Habilita as flags de futuro do React Router
// Isso removerá os avisos no console
window.__reactRouterEnableFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Nova versão disponível! Atualizar agora?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App pronto para funcionar offline");
  },
  onRegisterError(error) {
    console.error('Erro ao registrar service worker:', error);
  }
});

// Tratamento global de erros não capturados
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erro não capturado:', { message, source, lineno, colno, error });
    return true; // Impede que o erro seja exibido no console do navegador
  };

  // Tratamento de rejeições de promessas não tratadas
  window.onunhandledrejection = function(event) {
    console.error('Promessa rejeitada não tratada:', event.reason);
    event.preventDefault?.(); // Impede o log padrão do navegador
  };
}

// Renderiza a aplicação
const root = createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <App />
  </ThemeProvider>
);
