import { Link } from "react-router-dom";
import { FileText, Shield, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">ACR Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Sistema completo de gestão de entregas com rastreamento em tempo real.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@acrdelivery.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                privacidade@acrdelivery.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ACR Delivery. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
