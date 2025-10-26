import React from 'react';

export default function TestComponent() {
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
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ff00' }}>
          ✅ Teste - Se você vê isso, o React está funcionando!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          O problema pode estar na configuração do Supabase ou nos componentes UI.
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#333',
          borderRadius: '8px',
          border: '1px solid #00ff00'
        }}>
          <p>Verifique:</p>
          <ul style={{ textAlign: 'left' }}>
            <li>Variáveis de ambiente do Supabase</li>
            <li>Console do navegador para erros</li>
            <li>Rede (se há requisições falhando)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
