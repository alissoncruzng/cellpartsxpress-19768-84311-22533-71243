import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Package, BarChart3, Bike, Star, Settings, Users, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import acrLogo from "@/assets/logo.png";
import NotificationCenter from "@/components/NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface HeaderProps {
  cartItemsCount?: number;
  userRole?: "client" | "driver" | "admin";
}

export default function Header({ cartItemsCount = 0 }: HeaderProps) {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Verificar se está em modo desenvolvimento
  const isDevelopmentMode = localStorage.getItem('dev-session') !== null;

  const handleSignOut = async () => {
    try {
      // Limpar sessão real do Supabase
      const { error } = await supabase.auth.signOut();

      // Limpar sessão de desenvolvimento
      localStorage.removeItem('dev-session');

      if (error) {
        toast.error("Erro ao sair");
      } else {
        toast.success("Logout realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro ao sair");
      navigate("/");
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
          { to: '/admin/products', label: 'Produtos', icon: Package },
          { to: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
          { to: '/admin/drivers', label: 'Entregadores', icon: Bike },
          { to: '/admin/promotions', label: 'Promoções', icon: Settings },
          { to: '/admin/templates', label: 'Templates', icon: FileText },
          { to: '/admin/delivery-configs', label: 'Configurações', icon: Settings },
          { to: '/admin/ratings', label: 'Avaliações', icon: Star },
        ];
      case 'driver':
        return [
          { to: '/driver/dashboard', label: 'Dashboard', icon: BarChart3 },
        ];
      case 'wholesale':
        return [
          { to: '/wholesale/dashboard', label: 'Dashboard', icon: BarChart3 },
          { to: '/profile', label: 'Perfil', icon: User },
        ];
      case 'client':
      default:
        return [
          { to: '/catalog', label: 'Catálogo', icon: Package },
          { to: '/my-orders', label: 'Meus Pedidos', icon: ShoppingCart },
          { to: '/profile', label: 'Perfil', icon: User },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  if (!user) {
    return (
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold flex items-center gap-2">
              <img src={acrLogo} alt="ACR Logo" className="h-8 w-8" />
              ACR Delivery
            </Link>
            <Button onClick={() => navigate('/')} variant="outline">
              Entrar
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <img src={acrLogo} alt="ACR Logo" className="h-8 w-8" />
            ACR Delivery
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors btn-mobile-touch ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <NotificationCenter />

            {/* Carrinho - apenas para clientes */}
            {user?.role === 'client' && cartItemsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/checkout')}
                className="relative btn-mobile-touch"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Carrinho</span>
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemsCount}
                </Badge>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full md:h-10 md:w-10 h-12 w-12">
                  <Avatar className="h-10 w-10 md:h-10 md:w-10 h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                    <AvatarFallback>
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="w-fit mt-1">
                      {user.role === 'admin' ? 'Administrador' :
                       user.role === 'driver' ? 'Entregador' : 'Cliente'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Navigation - Mobile */}
                <div className="md:hidden">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link to={item.to} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
