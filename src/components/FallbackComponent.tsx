import React from 'react';

export default function FallbackComponent() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#00ff00' }}>
          ⚠️ Problema Detectado
        </h1>
        <div style={{
          backgroundColor: '#333',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #666',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#ffaa00' }}>Possíveis Causas da Tela Preta:</h3>
          <ul style={{ marginBottom: '1rem' }}>
            <li><strong>Supabase:</strong> Variáveis de ambiente não configuradas</li>
            <li><strong>Assets:</strong> Imagens não encontradas</li>
            <li><strong>CSS:</strong> Problemas com Tailwind CSS</li>
            <li><strong>Componentes:</strong> Erro em algum componente UI</li>
          </ul>

          <h4 style={{ marginBottom: '0.5rem', color: '#00ff00' }}>Verificações Necessárias:</h4>
          <ol style={{ marginLeft: '1rem' }}>
            <li>Configure as variáveis de ambiente do Supabase</li>
            <li>Verifique o console do navegador (F12)</li>
            <li>Execute: <code style={{ backgroundColor: '#555', padding: '0.2rem', borderRadius: '3px' }}>npm run dev</code></li>
            <li>Verifique se há erros no terminal</li>
          </ol>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <p><strong>Arquivo .env deve conter:</strong></p>
          <code style={{ backgroundColor: '#333', padding: '1rem', borderRadius: '4px', display: 'block', textAlign: 'left' }}>
            VITE_SUPABASE_URL=https://your-project-id.supabase.co<br/>
            VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
          </code>
        </div>
      </div>
    </div>
  );
}
