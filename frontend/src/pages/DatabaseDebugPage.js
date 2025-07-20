import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const DatabaseDebugPage = () => {
  const { user } = useContext(AuthContext);
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);

  const testConexionSupabase = async () => {
    setLoading(true);
    setResultado('🔍 Probando conexión a Supabase...\n');
    
    try {
      // Test 1: Verificar que supabase está disponible
      if (!supabase) {
        setResultado(prev => prev + '❌ Supabase no está inicializado\n');
        return;
      }
      
      setResultado(prev => prev + '✅ Supabase inicializado correctamente\n');

      // Test 1.5: Verificar URL y configuración
      setResultado(prev => prev + `🔍 URL Supabase: ${supabase.supabaseUrl}\n`);
      setResultado(prev => prev + `🔍 Key disponible: ${!!supabase.supabaseKey}\n`);

      // Test 2: Verificar conexión básica con más detalles
      setResultado(prev => prev + '🔍 Intentando conectar a tabla usuarios...\n');
      
      const { data, error, count } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        setResultado(prev => prev + `❌ Error conectando a tabla usuarios:\n`);
        setResultado(prev => prev + `   Mensaje: ${error.message}\n`);
        setResultado(prev => prev + `   Código: ${error.code || 'N/A'}\n`);
        setResultado(prev => prev + `   Detalles: ${error.details || 'N/A'}\n`);
        setResultado(prev => prev + `   Hint: ${error.hint || 'N/A'}\n`);
        setResultado(prev => prev + `   Error completo: ${JSON.stringify(error, null, 2)}\n`);
        
        // Intentar diagnóstico adicional
        if (error.message.includes('Failed to fetch')) {
          setResultado(prev => prev + '\n🔍 DIAGNÓSTICO: Error "Failed to fetch"\n');
          setResultado(prev => prev + '   Posibles causas:\n');
          setResultado(prev => prev + '   1. URL de Supabase incorrecta\n');
          setResultado(prev => prev + '   2. Problema de CORS\n');
          setResultado(prev => prev + '   3. Supabase project inactivo/pausado\n');
          setResultado(prev => prev + '   4. Problemas de red\n');
        }
        return;
      }
      
      setResultado(prev => prev + `✅ Conexión exitosa a tabla usuarios\n`);
      setResultado(prev => prev + `📊 Total usuarios: ${count}\n`);
      setResultado(prev => prev + `📋 Muestra de datos: ${JSON.stringify(data, null, 2)}\n`);

      // Test 3: Buscar usuario actual
      if (user?.email) {
        setResultado(prev => prev + `\n🔍 Buscando usuario: ${user.email}\n`);
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .single();
        
        if (userError) {
          setResultado(prev => prev + `⚠️ Usuario ${user.email} no encontrado en BD: ${userError.message}\n`);
        } else {
          setResultado(prev => prev + `✅ Usuario encontrado: ${JSON.stringify(userData, null, 2)}\n`);
        }
      }

      // Test 4: Verificar tabla laboratorios
      setResultado(prev => prev + '\n🔍 Verificando tabla laboratorios...\n');
      const { data: labData, error: labError } = await supabase
        .from('laboratorios')
        .select('*')
        .limit(5);
      
      if (labError) {
        setResultado(prev => prev + `❌ Error tabla laboratorios: ${labError.message}\n`);
      } else {
        setResultado(prev => prev + `✅ Laboratorios encontrados: ${labData.length}\n`);
        setResultado(prev => prev + `📋 Laboratorios: ${JSON.stringify(labData, null, 2)}\n`);
      }

      // Test 5: Verificar tabla reservas
      setResultado(prev => prev + '\n🔍 Verificando tabla reservas...\n');
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select('*')
        .limit(10)
        .order('created_at', { ascending: false });
      
      if (reservasError) {
        setResultado(prev => prev + `❌ Error tabla reservas: ${reservasError.message}\n`);
      } else {
        setResultado(prev => prev + `✅ Reservas encontradas: ${reservasData.length}\n`);
        if (reservasData.length > 0) {
          setResultado(prev => prev + `📋 Últimas reservas: ${JSON.stringify(reservasData, null, 2)}\n`);
        }
      }

    } catch (error) {
      setResultado(prev => prev + `❌ Error general capturado:\n`);
      setResultado(prev => prev + `   Mensaje: ${error.message}\n`);
      setResultado(prev => prev + `   Stack: ${error.stack}\n`);
      setResultado(prev => prev + `   Error completo: ${JSON.stringify(error, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testVariablesEntorno = () => {
    setLoading(false);
    setResultado('🔍 Verificando variables de entorno...\n');
    
    setResultado(prev => prev + `📋 Variables de entorno actuales:\n`);
    setResultado(prev => prev + `   REACT_APP_SUPABASE_URL: ${process.env.REACT_APP_SUPABASE_URL || 'NO DEFINIDA'}\n`);
    setResultado(prev => prev + `   REACT_APP_SUPABASE_ANON_KEY: ${process.env.REACT_APP_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NO DEFINIDA'}\n`);
    setResultado(prev => prev + `   NODE_ENV: ${process.env.NODE_ENV}\n\n`);
    
    // Mostrar configuración que se está usando
    const config = {
      url: process.env.REACT_APP_SUPABASE_URL || 'https://trnyhqywpioomkdhgugb.supabase.co',
      keyDefined: !!(process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
    };
    
    setResultado(prev => prev + `🔧 Configuración efectiva:\n`);
    setResultado(prev => prev + `   URL final: ${config.url}\n`);
    setResultado(prev => prev + `   Key disponible: ${config.keyDefined}\n\n`);
    
    // Comparar URLs
    const urlCorrecta = 'https://trnyhqywpioomkdhgugb.supabase.co';
    const urlUsada = config.url;
    
    if (urlUsada === urlCorrecta) {
      setResultado(prev => prev + `✅ URL correcta\n`);
    } else {
      setResultado(prev => prev + `❌ URL INCORRECTA!\n`);
      setResultado(prev => prev + `   Esperada: ${urlCorrecta}\n`);
      setResultado(prev => prev + `   Actual:   ${urlUsada}\n\n`);
      setResultado(prev => prev + `🛠️ SOLUCIÓN:\n`);
      setResultado(prev => prev + `   1. Ve a Vercel Dashboard\n`);
      setResultado(prev => prev + `   2. Settings → Environment Variables\n`);
      setResultado(prev => prev + `   3. Edita REACT_APP_SUPABASE_URL\n`);
      setResultado(prev => prev + `   4. Cambia a: ${urlCorrecta}\n`);
      setResultado(prev => prev + `   5. Redeploy la aplicación\n`);
    }
  };

  const testUrlSupabase = async () => {
    setLoading(true);
    setResultado('🔍 Probando URL de Supabase directamente...\n');
    
    try {
      const supabaseUrl = 'https://trnyhqywpioomkdhgugb.supabase.co';  // URL CORREGIDA
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybnlocXl3cGlvb21rZGhndWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ3MTAsImV4cCI6MjA2ODA0MDcxMH0.CxYnD2n4FH37lESyI2Wn3X4En9vNv9yMjzE_GHf1gk4';
      
      setResultado(prev => prev + `🔍 URL: ${supabaseUrl}\n`);
      setResultado(prev => prev + `🔍 Key: ${anonKey.substring(0, 50)}...\n`);
      
      // Test HTTP directo
      const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?select=count`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });
      
      setResultado(prev => prev + `📡 HTTP Status: ${response.status}\n`);
      setResultado(prev => prev + `📡 HTTP Status Text: ${response.statusText}\n`);
      
      if (!response.ok) {
        const errorText = await response.text();
        setResultado(prev => prev + `❌ Error HTTP: ${errorText}\n`);
        return;
      }
      
      const data = await response.json();
      setResultado(prev => prev + `✅ Respuesta HTTP exitosa\n`);
      setResultado(prev => prev + `📊 Datos: ${JSON.stringify(data, null, 2)}\n`);
      
    } catch (error) {
      setResultado(prev => prev + `❌ Error en test HTTP directo:\n`);
      setResultado(prev => prev + `   Mensaje: ${error.message}\n`);
      setResultado(prev => prev + `   Tipo: ${error.name}\n`);
      setResultado(prev => prev + `   Stack: ${error.stack}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testCrearReserva = async () => {
    setLoading(true);
    setResultado('🔍 Probando crear reserva de test...\n');
    
    try {
      if (!user?.email) {
        setResultado(prev => prev + '❌ No hay usuario logueado\n');
        return;
      }

      // Buscar usuario en BD
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, rol, nombre, apellido')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        setResultado(prev => prev + `❌ Usuario no encontrado: ${userError?.message}\n`);
        return;
      }

      setResultado(prev => prev + `✅ Usuario encontrado: ID ${userData.id}\n`);

      // Buscar primer laboratorio
      const { data: labData, error: labError } = await supabase
        .from('laboratorios')
        .select('id, nombre')
        .eq('activo', true)
        .limit(1)
        .single();

      if (labError || !labData) {
        setResultado(prev => prev + `❌ No hay laboratorios activos: ${labError?.message}\n`);
        return;
      }

      setResultado(prev => prev + `✅ Laboratorio encontrado: ${labData.nombre} (ID: ${labData.id})\n`);

      // Crear reserva de test
      const reservaTest = {
        usuario_id: userData.id,
        laboratorio_id: labData.id,
        fecha: '2025-07-23',
        bloque: 1,
        dia_semana: 'Miércoles',
        tipo_bloque: 'completo',
        curso: '1°C (Test)',
        asignatura: 'Matemática (Test)',
        profesor: userData.nombre,
        laboratorio: labData.nombre,
        estado: 'confirmada'
      };

      setResultado(prev => prev + `🔍 Creando reserva: ${JSON.stringify(reservaTest, null, 2)}\n`);

      const { data: reservaCreada, error: reservaError } = await supabase
        .from('reservas')
        .insert([reservaTest])
        .select()
        .single();

      if (reservaError) {
        setResultado(prev => prev + `❌ Error creando reserva: ${reservaError.message}\n`);
        setResultado(prev => prev + `📋 Detalles del error: ${JSON.stringify(reservaError, null, 2)}\n`);
      } else {
        setResultado(prev => prev + `✅ Reserva creada exitosamente!\n`);
        setResultado(prev => prev + `📋 Reserva: ${JSON.stringify(reservaCreada, null, 2)}\n`);
      }

    } catch (error) {
      setResultado(prev => prev + `❌ Error general: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔍 Debug Base de Datos</h1>
      <p>Usuario actual: {user?.email || 'No logueado'}</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testVariablesEntorno} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verificando...' : '🔍 Variables Entorno'}
        </button>
        
        <button 
          onClick={testConexionSupabase} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Probando...' : 'Probar Conexión'}
        </button>
        
        <button 
          onClick={testUrlSupabase} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Probando...' : 'Test HTTP Directo'}
        </button>
        
        <button 
          onClick={testCrearReserva} 
          disabled={loading || !user}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: user ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || !user) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creando...' : 'Test Crear Reserva'}
        </button>
      </div>

      <div style={{ 
        background: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        maxHeight: '600px',
        overflow: 'auto',
        fontSize: '0.9rem'
      }}>
        {resultado || 'Haz clic en "Probar Conexión" para empezar...'}
      </div>
    </div>
  );
};

export default DatabaseDebugPage;
