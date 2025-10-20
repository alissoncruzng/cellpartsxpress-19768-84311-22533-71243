import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductImportRow {
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
}

export const ProductImport = () => {
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const products: ProductImportRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const product: Partial<ProductImportRow> = {
          stock: 0, // default
        };

        headers.forEach((header, index) => {
          const value = values[index];
          
          if (header === 'preco' || header === 'preço') {
            product.price = parseFloat(value.replace('R$', '').replace(',', '.'));
          } else if (header === 'estoque') {
            product.stock = parseInt(value) || 0;
          } else if (header === 'nome') {
            product.name = value;
          } else if (header === 'categoria') {
            product.category = value;
          } else if (header === 'descricao' || header === 'descrição') {
            product.description = value;
          } else if (header === 'imagem' || header === 'image_url') {
            product.image_url = value;
          }
        });

        if (product.name && product.category && typeof product.price === 'number' && product.price >= 0) {
          products.push(product as ProductImportRow);
        }
      }

      if (products.length === 0) {
        toast.error("Nenhum produto válido encontrado no arquivo");
        return;
      }

      // Inserir produtos no banco
      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) throw error;

      toast.success(`${products.length} produtos importados com sucesso!`);
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error("Erro ao importar produtos: " + error.message);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'nome,categoria,preco,estoque,descricao,imagem\nProduto Exemplo,Categoria Teste,99.90,10,Descrição do produto,https://exemplo.com/imagem.jpg';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_produtos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Produtos CSV
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo CSV para adicionar múltiplos produtos de uma vez
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Template CSV
          </Button>
        </div>
        
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-primary mb-2" />
            <p className="text-sm font-medium mb-1">
              {importing ? "Importando..." : "Clique para fazer upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              Arquivos CSV ou Excel (máx. 5MB)
            </p>
          </label>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Formato esperado:</strong></p>
          <p>• nome (obrigatório)</p>
          <p>• categoria (obrigatório)</p>
          <p>• preco (obrigatório, use ponto como decimal)</p>
          <p>• estoque (opcional, padrão: 0)</p>
          <p>• descricao (opcional)</p>
          <p>• imagem (opcional, URL da imagem)</p>
        </div>
      </CardContent>
    </Card>
  );
};
