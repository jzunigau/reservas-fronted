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

      // Test 2: Verificar conexión básica
      const { data, error } = await supabase
        .from('usuarios')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        setResultado(prev => prev + `❌ Error conectando a tabla usuarios: ${error.message}\n`);
        return;
      }
      
      setResultado(prev => prev + `✅ Conexión exitosa a tabla usuarios (${data} usuarios)\n`);

      // Test 3: Buscar usuario actual
      if (user?.email) {
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
      setResultado(prev => prev + `❌ Error general: ${error.message}\n`);
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
