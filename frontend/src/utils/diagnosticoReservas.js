// Herramienta de diagnóstico para comparar datos de Supabase vs localStorage

import { supabase } from '../config/supabase'

export const diagnosticarReservas = async () => {
  console.log('🔍 DIAGNÓSTICO RESERVAS - Iniciando...')
  
  const resultado = {
    supabase: {
      disponible: false,
      reservas: [],
      error: null
    },
    localStorage: {
      reservas: [],
      clave: 'sistema_reservas_laboratorio'
    },
    problema: null
  }

  // 1. Verificar Supabase
  try {
    console.log('🔍 DIAGNÓSTICO - Verificando Supabase...')
    resultado.supabase.disponible = !!(supabase?.from)
    
    if (supabase?.from) {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        resultado.supabase.error = error.message
        console.error('🚨 DIAGNÓSTICO - Error Supabase:', error)
      } else {
        resultado.supabase.reservas = data || []
        console.log('✅ DIAGNÓSTICO - Supabase OK:', data?.length || 0, 'reservas')
      }
    }
  } catch (error) {
    resultado.supabase.error = error.message
    console.error('🚨 DIAGNÓSTICO - Excepción Supabase:', error)
  }

  // 2. Verificar localStorage
  try {
    console.log('🔍 DIAGNÓSTICO - Verificando localStorage...')
    const localData = localStorage.getItem('sistema_reservas_laboratorio')
    if (localData) {
      resultado.localStorage.reservas = JSON.parse(localData)
      console.log('✅ DIAGNÓSTICO - localStorage OK:', resultado.localStorage.reservas.length, 'reservas')
    } else {
      console.log('⚠️ DIAGNÓSTICO - localStorage vacío')
    }
  } catch (error) {
    console.error('🚨 DIAGNÓSTICO - Error localStorage:', error)
  }

  // 3. Analizar problema
  if (resultado.supabase.error) {
    resultado.problema = `Error en Supabase: ${resultado.supabase.error}`
  } else if (!resultado.supabase.disponible) {
    resultado.problema = 'Supabase no está disponible'
  } else if (resultado.supabase.reservas.length === 0 && resultado.localStorage.reservas.length > 0) {
    resultado.problema = 'Supabase vacío pero localStorage tiene datos - Mostrando datos obsoletos'
  } else if (resultado.supabase.reservas.length > 0 && resultado.localStorage.reservas.length > 0) {
    resultado.problema = 'Datos en ambos lugares - Posible conflicto'
  }

  console.log('📊 DIAGNÓSTICO COMPLETO:', resultado)
  return resultado
}
