import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [connectionTest, setConnectionTest] = useState('Testing...');

  useEffect(() => {
    console.log('🔍 DEBUG PAGE - Iniciando tests...');
    
    // Test 1: Variables de entorno
    const envTest = {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
      REACT_APP_SUPABASE_ANON_KEY: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      allReactVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
    };

    // Test 2: Supabase connection
    const testSupabaseConnection = async () => {
      try {
        console.log('🔍 DEBUG PAGE - Testing Supabase connection...');
        
        // Test simple query
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        
        if (error) {
          console.error('🚨 DEBUG PAGE - Supabase error:', error);
          setConnectionTest(`Error: ${error.message}`);
        } else {
          console.log('✅ DEBUG PAGE - Supabase connection OK');
          setConnectionTest('✅ Conexión exitosa');
        }
      } catch (err) {
        console.error('🚨 DEBUG PAGE - Connection test failed:', err);
        setConnectionTest(`Error de conexión: ${err.message}`);
      }
    };

    setDebugInfo(envTest);
    testSupabaseConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Página de Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h2>📊 Variables de Entorno</h2>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h2>🔌 Test de Conexión Supabase</h2>
        <p><strong>Estado:</strong> {connectionTest}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h2>🌐 Información del Entorno</h2>
        <p><strong>URL actual:</strong> {window.location.href}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Fecha:</strong> {new Date().toISOString()}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h2>📋 Instrucciones</h2>
        <ol>
          <li>Abre las herramientas de desarrollador (F12)</li>
          <li>Ve a la pestaña "Console"</li>
          <li>Busca mensajes que empiecen con "🔍 DEBUG"</li>
          <li>Copia todos los mensajes de debug</li>
          <li>Compártelos para análisis</li>
        </ol>
      </div>

      <button 
        onClick={() => window.location.href = '/login'}
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        Ir a Login
      </button>

      <button 
        onClick={() => window.location.reload()}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Recargar Página
      </button>
    </div>
  );
};

export default DebugPage;
