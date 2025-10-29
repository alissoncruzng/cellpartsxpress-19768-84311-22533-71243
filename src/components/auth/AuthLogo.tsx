import { Smartphone, Package, Shield, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthLogoProps = {
  className?: string;
  iconClassName?: string;
};

export function AuthLogo({ className, iconClassName }: AuthLogoProps) {
  return (
    <div className={cn("relative w-16 h-16 mx-auto mb-4", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full bg-primary/10 animate-pulse" />
        <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
          <Package className={cn("h-6 w-6", iconClassName)} />
        </div>
      </div>
      <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold border-2 border-background">
        <span>CPX</span>
      </div>
    </div>
  );
}

export function AuthLogoWithText() {
  return (
    <div className="text-center space-y-2">
      <AuthLogo className="mx-auto" />
      <h1 className="text-2xl font-bold text-foreground">Cell Parts Xpress</h1>
      <p className="text-sm text-muted-foreground">Soluções em peças para celular</p>
    </div>
  );
}
