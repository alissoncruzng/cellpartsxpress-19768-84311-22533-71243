import { Button } from '@/components/ui/button';
import { Settings, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AdminButton() {
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();

  if (!user || !isAdmin) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12"
            onClick={() => navigate('/admin')}
            aria-label="Painel de administração"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Painel de administração</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
