import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Package, LayoutDashboard, Bike } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import acrLogo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  cartItemsCount?: number;
  userRole?: "client" | "driver" | "admin";
}

export default function Header({ cartItemsCount = 0, userRole = "client" }: HeaderProps) {
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (userRole === "driver") return "/driver/dashboard";
    if (userRole === "admin") return "/admin/products";
    return "/catalog";
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    }
  };

  const menuItems = {
    client: [
      { label: "Catálogo", icon: Package, path: "/catalog" },
      { label: "Meus Pedidos", icon: ShoppingCart, path: "/my-orders" },
    ],
    driver: [
      { label: "Painel", icon: LayoutDashboard, path: "/driver/dashboard" },
    ],
    admin: [
      { label: "Produtos", icon: Package, path: "/admin/products" },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src={acrLogo} 
            alt="ACR Logo" 
            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(196,255,0,0.4)]"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">ACR Delivery</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userRole === "client" && cartItemsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/checkout")}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Carrinho</span>
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs" variant="destructive">
                {cartItemsCount}
              </Badge>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {menuItems[userRole].map((item) => (
                <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
