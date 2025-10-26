import { useState, useCallback } from 'react';
import { uploadFile, deleteFile } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';

type UseImageUploadOptions = {
  bucket: string;
  path: string;
  initialImageUrl?: string | null;
  maxSizeMB?: number;
  onUploadSuccess?: (url: string) => void;
  onRemoveSuccess?: () => void;
};

export function useImageUpload({
  bucket,
  path,
  initialImageUrl = null,
  maxSizeMB = 5,
  onUploadSuccess,
  onRemoveSuccess,
}: UseImageUploadOptions) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      try {
        const { url, error: uploadError } = await uploadFile({
          bucket,
          path,
          file,
          maxSizeMB,
        });

        if (uploadError) {
          throw new Error(uploadError);
        }

        if (!url) {
          throw new Error('Não foi possível obter a URL da imagem.');
        }

        setImageUrl(url);
        onUploadSuccess?.(url);
        return url;
      } catch (err) {
        console.error('Erro ao fazer upload da imagem:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.';
        setError(errorMessage);
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, maxSizeMB, onUploadSuccess, path, toast]
  );

  const handleRemove = useCallback(async () => {
    if (!imageUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // Extrai o caminho do arquivo da URL
      const filePath = imageUrl.split('/').pop();
      if (!filePath) {
        throw new Error('Não foi possível identificar o arquivo para remoção.');
      }

      const { error: deleteError } = await deleteFile(bucket, filePath);
      if (deleteError) {
        throw new Error(deleteError);
      }

      setImageUrl(null);
      onRemoveSuccess?.();
    } catch (err) {
      console.error('Erro ao remover a imagem:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover a imagem.';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [bucket, imageUrl, onRemoveSuccess, toast]);

  return {
    imageUrl,
    isUploading,
    error,
    uploadImage: handleUpload,
    removeImage: handleRemove,
  };
}
