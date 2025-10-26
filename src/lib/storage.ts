import { supabase } from './supabase';

type UploadOptions = {
  bucket: string;
  path: string;
  file: File;
  maxSizeMB?: number;
};

export const uploadFile = async ({
  bucket,
  path,
  file,
  maxSizeMB = 5,
}: UploadOptions): Promise<{ url?: string; error?: string }> => {
  try {
    // Validação do tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return { error: 'Por favor, envie apenas arquivos de imagem.' };
    }

    // Validação do tamanho do arquivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { error: `O arquivo deve ter no máximo ${maxSizeMB}MB.` };
    }

    // Gera um nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Faz o upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return { error: 'Erro ao fazer upload do arquivo.' };
    }

    // Obtém a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error('Erro no upload:', error);
    return { error: 'Ocorreu um erro ao processar o arquivo.' };
  }
};

export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      return { error: 'Erro ao remover o arquivo.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { error: 'Ocorreu um erro ao remover o arquivo.' };
  }
};
