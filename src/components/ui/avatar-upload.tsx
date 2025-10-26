import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  onUpload: (file: File) => Promise<string>;
  initialImageUrl?: string;
  className?: string;
}

export function AvatarUpload({ onUpload, initialImageUrl, className }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Verifica se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo de imagem válido (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Verifica o tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Cria uma URL de visualização para a imagem
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      try {
        setIsUploading(true);
        // Chama a função de upload fornecida
        await onUpload(file);
        
        toast({
          title: 'Sucesso',
          description: 'Imagem enviada com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        setPreviewUrl(initialImageUrl || null);
        
        toast({
          title: 'Erro',
          description: 'Não foi possível fazer o upload da imagem. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        // Limpa o input de arquivo para permitir o upload do mesmo arquivo novamente
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUpload, initialImageUrl, toast]
  );

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-muted">
          <AvatarImage src={previewUrl || ''} alt="Preview" />
          <AvatarFallback className="text-lg">
            {getInitials(initialImageUrl ? 'Usuário' : '')}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
          disabled={isUploading}
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Alterar Foto'
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Formatos: JPG, PNG (máx. 5MB)
      </p>
    </div>
  );
}
