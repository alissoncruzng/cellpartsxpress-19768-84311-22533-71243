import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type ImageUploadProps = {
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  initialImageUrl?: string | null;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'custom';
  maxSizeMB?: number;
  disabled?: boolean;
  label?: string;
};

export function ImageUpload({
  onUpload,
  onRemove,
  initialImageUrl,
  className,
  aspectRatio = 'square',
  maxSizeMB = 5,
  disabled = false,
  label = 'Enviar imagem',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Atualiza a prévia quando a imagem inicial mudar
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Por favor, selecione um arquivo de imagem válido.' };
    }

    // Verifica o tamanho do arquivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `A imagem deve ter no máximo ${maxSizeMB}MB.` };
    }

    return { valid: true };
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Valida o arquivo
      const { valid, error: validationError } = validateFile(file);
      if (!valid) {
        setError(validationError);
        toast({
          title: 'Erro',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      setError(null);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        setIsUploading(true);
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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUpload, initialImageUrl, maxSizeMB, toast]
  );

  const handleRemove = async () => {
    if (!onRemove) return;
    
    try {
      setIsUploading(true);
      await onRemove();
      setPreviewUrl(null);
    } catch (error) {
      console.error('Erro ao remover a imagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    custom: '',
  }[aspectRatio];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium">{label}</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      
      <div className="relative group">
        <div
          className={cn(
            'w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden',
            aspectRatioClasses,
            disabled && 'opacity-50 cursor-not-allowed',
            !previewUrl && 'min-h-[200px]'
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique para enviar ou arraste uma imagem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos suportados: JPG, PNG, WEBP (máx. {maxSizeMB}MB)
              </p>
            </div>
          )}
        </div>

        {previewUrl && onRemove && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 rounded-full h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="text-xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Enviando...
            </>
          ) : (
            'Selecionar arquivo'
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Máx. {maxSizeMB}MB
        </div>
      </div>
    </div>
  );
}
