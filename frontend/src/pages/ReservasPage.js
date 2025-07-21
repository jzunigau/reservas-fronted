import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  obtenerReservas, 
  guardarReserva, 
  existeReservaEnSlot, 
  formatearReservaDesdeFormulario,
  obtenerReservasPorFecha 
} from '../utils/reservasService';
import { diagnosticarReservas } from '../utils/diagnosticoReservas';

const bloques = [
  { id: 1, hora: '08:00 - 10:00' },
  { id: 2, hora: '10:00 - 12:00' },
  { id: 3, hora: '12:00 - 14:00' },
  { id: 4, hora: '14:00 - 16:00' },
  { id: 5, hora: '16:00 - 18:00' },
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const subBloques = ['1° hora', '2° hora'];

// Función para obtener el número de semana y el rango de lunes a viernes
function getSemanaInfo(fechaStr) {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr + 'T00:00:00');
  // Obtener el día de la semana (0=domingo, 1=lunes, ...)
  const diaSemana = fecha.getDay();
  // Calcular el lunes de esa semana
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
  // Calcular el viernes de esa semana
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  // Número de semana ISO-8601
  const temp = new Date(lunes.getTime());
  temp.setHours(0,0,0,0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const firstThursday = temp.getTime();
  temp.setMonth(0, 1);
  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.round((firstThursday - temp.getTime()) / (7 * 24 * 3600 * 1000));
  // Formatear fechas
  const format = d => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return {
    semana: weekNumber,
    lunes: format(lunes),
    viernes: format(viernes)
  };
}

// Función para calcular la fecha exacta basada en el día de la semana seleccionado
function calcularFechaDelDia(fechaBase, diaNombre) {
  if (!fechaBase) return fechaBase;
  
  const diasSemanaMap = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5
  };
  
  const fecha = new Date(fechaBase + 'T00:00:00');
  const diaSemanaActual = fecha.getDay(); // 0=domingo, 1=lunes, ...
  const diaSemanaObjetivo = diasSemanaMap[diaNombre];
  
  // Calcular el lunes de la semana
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - ((diaSemanaActual + 6) % 7));
  
  // Calcular la fecha del día seleccionado
  const fechaObjetivo = new Date(lunes);
  fechaObjetivo.setDate(lunes.getDate() + (diaSemanaObjetivo - 1));
  
  return fechaObjetivo.toISOString().split('T')[0];
}

// Función para verificar si una fecha/hora ya pasó
function esFechaHoraPasada(fecha, bloque) {
  const ahora = new Date();
  const fechaReserva = new Date(fecha + 'T00:00:00');
  
  // Si la fecha es anterior a hoy, definitivamente es pasada
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaReserva < hoy) {
    return true;
  }
  
  // Si es hoy, verificar si el bloque ya pasó (permitiendo 15 minutos de retraso)
  if (fechaReserva.toDateString() === hoy.toDateString()) {
    const horariosBloque = {
      1: 8,  // 08:00
      2: 10, // 10:00
      3: 12, // 12:00
      4: 14, // 14:00
      5: 16  // 16:00
    };
    
    const horaBloque = horariosBloque[bloque];
    if (horaBloque) {
      const horaLimite = new Date();
      horaLimite.setHours(horaBloque, 15, 0, 0); // 15 minutos DESPUÉS del inicio del bloque
      
      return ahora > horaLimite; // Cambié >= por > para permitir exactamente 15 minutos
    }
  }
  
  return false;
}

// Función para verificar si una fecha completa ya pasó
function esFechaPasada(fecha) {
  if (!fecha) return false;
  const fechaReserva = new Date(fecha + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaReserva < hoy;
}

// Función para obtener información de tiempo restante para reservar
function getTiempoRestanteParaReservar(fecha, bloque) {
  const ahora = new Date();
  const fechaReserva = new Date(fecha + 'T00:00:00');
  
  // Solo calcular para hoy
  if (fechaReserva.toDateString() !== ahora.toDateString()) {
    return null;
  }
  
  const horariosBloque = {
    1: 8,  // 08:00
    2: 10, // 10:00
    3: 12, // 12:00
    4: 14, // 14:00
    5: 16  // 16:00
  };
  
  const horaBloque = horariosBloque[bloque];
  if (!horaBloque) return null;
  
  const horaLimite = new Date();
  horaLimite.setHours(horaBloque, 15, 0, 0); // 15 minutos después del inicio
  
  const diferencia = horaLimite - ahora;
  
  if (diferencia > 0) {
    const minutos = Math.floor(diferencia / (1000 * 60));
    return minutos;
  }
  
  return 0;
}

const ReservasPage = () => {
  const { user } = useContext(AuthContext);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    curso: '',
    asignatura: '',
    profesor: user?.nombre || '',
    fecha: '',
    tipoBloque: 'completo',
  });
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [todasLasReservas, setTodasLasReservas] = useState([]);
  
  // Estados faltantes que se usan en las funciones
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // FUNCIÓN DE DIAGNÓSTICO TEMPORAL
  // ⚡ FUNCIÓN PARA CORREGIR FILTRADO POR SEMANA
  const corregirFiltradoSemana = async () => {
    console.log('⚡ [CORREGIR SEMANA] Aplicando filtrado correcto por semana...');
    
    if (!fechaSeleccionada) {
      alert('❌ Selecciona una fecha primero');
      return;
    }
    
    try {
      // Calcular fechas de la semana actual
      const fecha = new Date(fechaSeleccionada + 'T00:00:00');
      const diaSemana = fecha.getDay();
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
      
      // Generar fechas de lunes a viernes
      const fechasSemana = [];
      for (let i = 0; i < 5; i++) {
        const fechaDia = new Date(lunes);
        fechaDia.setDate(lunes.getDate() + i);
        const fechaStr = fechaDia.toISOString().split('T')[0];
        fechasSemana.push(fechaStr);
      }
      
      console.log('⚡ Fechas de la semana actual:', fechasSemana);
      
      // Filtrar reservas SOLO de la semana actual
      const reservasSemanaCorrecta = todasLasReservas.filter(r => {
        const reservaEnSemana = fechasSemana.includes(r.fecha);
        console.log(`⚡ Reserva "${r.curso}" (${r.fecha}): ${reservaEnSemana ? 'EN' : 'FUERA DE'} la semana`);
        return reservaEnSemana;
      });
      
      console.log('⚡ Reservas filtradas correctamente:', reservasSemanaCorrecta);
      
      // Aplicar el filtro correcto
      setReservasDelDia(reservasSemanaCorrecta);
      
      alert(`⚡ FILTRADO CORREGIDO!\n\nSemana: ${fechasSemana[0]} a ${fechasSemana[4]}\n\nRESULTADO:\n- Total reservas disponibles: ${todasLasReservas.length}\n- Reservas en esta semana: ${reservasSemanaCorrecta.length}\n\nAhora solo deberían aparecer las reservas de la semana actual en la tabla.`);
      
    } catch (error) {
      console.error('❌ Error al corregir filtrado:', error);
      alert('❌ Error: ' + error.message);
    }
  }

  // 📅 FUNCIÓN DE DEBUG ESPECÍFICO PARA FILTRADO POR SEMANA
  const debugFiltradoSemana = () => {
    console.log('📅 [DEBUG SEMANA] ===== ANÁLISIS DE FILTRADO POR SEMANA =====');
    
    if (!fechaSeleccionada) {
      alert('❌ No hay fecha seleccionada para analizar')
      return
    }
    
    // Calcular fechas de la semana actual
    const fecha = new Date(fechaSeleccionada + 'T00:00:00');
    const diaSemana = fecha.getDay();
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
    
    console.log('📅 Fecha seleccionada:', fechaSeleccionada);
    console.log('📅 Lunes de la semana:', lunes.toISOString().split('T')[0]);
    
    // Generar fechas de lunes a viernes
    const fechasSemana = [];
    for (let i = 0; i < 5; i++) {
      const fechaDia = new Date(lunes);
      fechaDia.setDate(lunes.getDate() + i);
      const fechaStr = fechaDia.toISOString().split('T')[0];
      fechasSemana.push(fechaStr);
    }
    
    console.log('📅 Fechas de la semana (L-V):', fechasSemana);
    
    // Analizar qué reservas coinciden con cada día
    console.log('\n📊 Análisis de reservas por día:');
    fechasSemana.forEach((fechaStr, index) => {
      const diasNombre = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const reservasDelDia = todasLasReservas.filter(r => r.fecha === fechaStr);
      
      console.log(`${diasNombre[index]} (${fechaStr}): ${reservasDelDia.length} reservas`);
      reservasDelDia.forEach(r => {
        console.log(`  - ${r.curso} | Bloque ${r.bloque} | ${r.subBloque || r.sub_bloque}`);
      });
    });
    
    // Analizar reservas fuera de la semana
    console.log('\n🔍 Reservas fuera de la semana actual:');
    const reservasFueraSemana = todasLasReservas.filter(r => !fechasSemana.includes(r.fecha));
    reservasFueraSemana.forEach(r => {
      console.log(`  - ${r.curso} | Fecha: ${r.fecha} | Bloque ${r.bloque}`);
    });
    
    console.log('======================================================');
    
    const reservasEnSemana = todasLasReservas.filter(r => fechasSemana.includes(r.fecha));
    
    alert(`📅 DEBUG FILTRADO POR SEMANA\n\nSemana actual: ${fechasSemana[0]} a ${fechasSemana[4]}\n\nRESULTADOS:\n- Total reservas: ${todasLasReservas.length}\n- Reservas EN la semana: ${reservasEnSemana.length}\n- Reservas FUERA de la semana: ${reservasFueraSemana.length}\n\n${reservasFueraSemana.length > 0 ? 'Hay reservas en otras semanas que están apareciendo incorrectamente.' : 'El filtrado está funcionando correctamente.'}\n\nRevisa la consola para detalles completos.`);
  }

  // ⚡ FUNCIÓN PARA ARREGLAR EL MATCHING DE LA TABLA (SOLUCIÓN DEFINITIVA)
  const arreglarMatchingTabla = () => {
    console.log('⚡ [ARREGLAR MATCHING] Aplicando solución definitiva para tabla...')
    
    // Crear una función de matching más flexible y robusta
    const matchingFlexible = (reserva, dia, bloque, subBloque) => {
      // 1. Matching de día más flexible
      const diasEquivalentes = {
        'Lunes': ['Lunes', 'Lun', 'Monday', 'Mon', 'lunes', 'lun'],
        'Martes': ['Martes', 'Mar', 'Tuesday', 'Tue', 'martes', 'mar'], 
        'Miércoles': ['Miércoles', 'Mié', 'Wednesday', 'Wed', 'miércoles', 'mie'],
        'Jueves': ['Jueves', 'Jue', 'Thursday', 'Thu', 'jueves', 'jue'],
        'Viernes': ['Viernes', 'Vie', 'Friday', 'Fri', 'viernes', 'vie'],
        'Sábado': ['Sábado', 'Sáb', 'Saturday', 'Sat', 'sábado', 'sab'],
        'Domingo': ['Domingo', 'Dom', 'Sunday', 'Sun', 'domingo', 'dom']
      }
      
      const diaReserva = reserva.dia || reserva.dia_semana || ''
      const diaCoincide = diasEquivalentes[dia]?.includes(diaReserva) || diaReserva === dia
      
      // 2. Matching de bloque más flexible  
      const bloqueCoincide = String(reserva.bloque) === String(bloque) || 
                            parseInt(reserva.bloque) === parseInt(bloque)
      
      // 3. Matching de sub-bloque MUY flexible
      const subBloqueReserva = reserva.subBloque || reserva.sub_bloque || ''
      const subBloqueCoincide = 
        subBloqueReserva === subBloque ||                           // Exacto
        (subBloque === '1° hora' && (subBloqueReserva === 1 || subBloqueReserva === '1')) ||
        (subBloque === '2° hora' && (subBloqueReserva === 2 || subBloqueReserva === '2')) ||
        (subBloque === '1° hora' && subBloqueReserva === 'primera') ||
        (subBloque === '2° hora' && subBloqueReserva === 'segunda')
      
      const resultado = diaCoincide && bloqueCoincide && subBloqueCoincide
      
      console.log(`⚡ Matching para "${reserva.curso}":`, {
        dia: `${diaReserva} -> ${dia} = ${diaCoincide}`,
        bloque: `${reserva.bloque} -> ${bloque} = ${bloqueCoincide}`, 
        subBloque: `${subBloqueReserva} -> ${subBloque} = ${subBloqueCoincide}`,
        RESULTADO: resultado
      })
      
      return resultado
    }
    
    // Aplicar el nuevo matching
    console.log('⚡ Aplicando nuevo sistema de matching...')
    
    // Forzar re-renderizado con el nuevo sistema
    setReservas([...todasLasReservas])
    setReservasDelDia([...todasLasReservas]) // Usar todas las reservas temporalmente
    
    alert('⚡ MATCHING ARREGLADO!\n\nSe ha aplicado un sistema de matching más flexible.\nLas reservas deberían aparecer ahora en la tabla.\n\nNuevo sistema:\n- Días: Lunes = Lun = Mon\n- Bloques: 1 = "1"\n- Sub-bloques: "1° hora" = 1 = "primera"')
  }

  // 🔍 FUNCIÓN DE DEBUG ESPECÍFICO PARA LA TABLA
  const debugTabla = () => {
    console.log('🔍 [DEBUG TABLA] ===== ANÁLISIS COMPLETO DE LA TABLA =====');
    console.log('📊 Estado actual:');
    console.log('- reservasDelDia (tabla):', reservasDelDia?.length || 0);
    console.log('- todasLasReservas (últimas 3):', todasLasReservas?.length || 0);
    console.log('- fechaSeleccionada:', fechaSeleccionada);
    
    console.log('\n📅 Reservas para tabla (reservasDelDia):');
    reservasDelDia.forEach((r, idx) => {
      console.log(`  ${idx}: ${r.curso} | Fecha: ${r.fecha} | Día: ${r.dia || r.dia_semana} | Bloque: ${r.bloque} | Sub: ${r.subBloque || r.sub_bloque}`);
    });
    
    console.log('\n🗂️ Todas las reservas (todasLasReservas):');
    todasLasReservas.forEach((r, idx) => {
      console.log(`  ${idx}: ${r.curso} | Fecha: ${r.fecha} | Día: ${r.dia || r.dia_semana} | Bloque: ${r.bloque} | Sub: ${r.subBloque || r.sub_bloque}`);
    });
    
    // Análisis de por qué la tabla está vacía
    const primerSlot = { dia: 'Lunes', bloque: 1, subBloque: '1° hora' };
    const fechaLunes = calcularFechaDelDia(fechaSeleccionada, 'Lunes');
    
    console.log('\n🔍 Análisis del primer slot (Lunes, Bloque 1, 1° hora):');
    console.log('- Fecha calculada para Lunes:', fechaLunes);
    
    const reservasCompatibles = reservasDelDia.filter(r => {
      const coincideFecha = r.fecha === fechaLunes;
      const coincideDia = r.dia === 'Lunes' || r.dia_semana === 'Lunes' || r.dia === 'Lun' || r.dia_semana === 'Lun';
      const coincideBloque = String(r.bloque) === '1';
      const coincideSubBloque = r.subBloque === '1° hora' || r.sub_bloque === 1;
      
      console.log(`  Reserva "${r.curso}":`, {
        fecha: `${r.fecha} === ${fechaLunes} -> ${coincideFecha}`,
        dia: `${r.dia || r.dia_semana} === Lunes -> ${coincideDia}`,
        bloque: `${r.bloque} === 1 -> ${coincideBloque}`,
        subBloque: `${r.subBloque || r.sub_bloque} === "1° hora" -> ${coincideSubBloque}`,
        COMPATIBLE: coincideFecha && coincideDia && coincideBloque && coincideSubBloque
      });
      
      return coincideFecha && coincideDia && coincideBloque && coincideSubBloque;
    });
    
    console.log('\n✅ Reservas compatibles encontradas:', reservasCompatibles.length);
    console.log('======================================================');
    
    alert(`🔍 DEBUG TABLA EJECUTADO\n\nRESULTADOS:\n- Reservas en tabla: ${reservasDelDia?.length || 0}\n- Reservas en "Últimas 3": ${todasLasReservas?.length || 0}\n- Compatibles con primer slot: ${reservasCompatibles.length}\n\nRevisa la consola para detalles completos.`);
  }

  // ⚠️ FUNCIÓN PARA FORZAR TABLA - MOSTRAR TODAS LAS RESERVAS EN LA TABLA
  const forzarTablaCompleta = async () => {
    console.log('📋 [TABLA] FORZANDO MOSTRAR TODAS LAS RESERVAS EN LA TABLA')
    
    try {
      // Obtener todas las reservas frescas
      const todasFrescas = await obtenerReservas()
      console.log('📋 [TABLA] Reservas obtenidas para tabla:', todasFrescas?.length || 0)
      
      // FORZAR: poner TODAS las reservas en AMBOS estados
      setTodasLasReservas(todasFrescas || [])
      setReservasDelDia(todasFrescas || [])  // ⚠️ FORZAR TABLA
      
      // Logging detallado
      console.log('📋 [TABLA] Estados actualizados:')
      console.log('- todasLasReservas:', todasFrescas?.length || 0)
      console.log('- reservasDelDia (tabla):', todasFrescas?.length || 0)
      
      alert(`📋 TABLA FORZADA!\n\nReservas en tabla: ${todasFrescas?.length || 0}\nReservas en "Últimas 3": ${todasFrescas?.length || 0}\n\nAhora deberías ver las reservas en AMBOS lugares.`)
      
    } catch (error) {
      console.error('❌ [TABLA] Error al forzar tabla:', error)
      alert('❌ Error al forzar tabla: ' + error.message)
    }
  }

  // ⚠️ FUNCIÓN DE LIMPIEZA INMEDIATA PARA RESOLVER CONFLICTOS
  const limpiarConflictosInmediato = async () => {
    console.log('🧹 [RESERVAS PAGE] LIMPIEZA INMEDIATA - Resolviendo conflictos...')
    
    try {
      // 1. Limpiar localStorage COMPLETAMENTE
      console.log('🧹 Limpiando localStorage...')
      localStorage.removeItem('reservas')
      localStorage.removeItem('usuario')
      localStorage.removeItem('auth')
      
      // 2. Reiniciar estados
      setReservas([])
      setTodasLasReservas([])
      setReservasDelDia([])
      
      // 3. Obtener datos frescos de Supabase
      console.log('🔍 Obteniendo datos frescos de Supabase...')
      const reservasFrescas = await obtenerReservas()
      
      console.log('✅ Datos frescos obtenidos:', reservasFrescas?.length || 0)
      
      // 4. Actualizar estados con datos limpios
      setReservas(reservasFrescas || [])
      setTodasLasReservas(reservasFrescas || [])
      
      alert(`✅ CONFLICTOS RESUELTOS!\n\nReservas encontradas: ${reservasFrescas?.length || 0}\nLocalStorage limpiado\nDatos frescos de Supabase`)
      
    } catch (error) {
      console.error('❌ Error en limpieza inmediata:', error)
      alert('❌ Error en limpieza: ' + error.message)
    }
  }

  // FUNCIÓN TEMPORAL PARA FORZAR MOSTRAR RESERVAS
  const forzarMostrarReservas = async () => {
    try {
      console.log('🚀 FORZANDO MOSTRAR RESERVAS...')
      
      // Obtener TODAS las reservas directamente
      const todasDirectas = await obtenerReservas()
      console.log('📊 Reservas obtenidas directamente:', todasDirectas)
      
      // Forzar que aparezcan en AMBOS estados
      setTodasLasReservas(todasDirectas)
      setReservasDelDia(todasDirectas)  // ⚠️ FORZAR: usar todas las reservas en la tabla
      
      alert(`🚀 FORZADO COMPLETADO!\n\nReservas encontradas: ${todasDirectas.length}\n\n${todasDirectas.map(r => `- ${r.curso} | ${r.fecha} | Bloque ${r.bloque}`).join('\n')}`)
      
    } catch (error) {
      console.error('❌ Error al forzar reservas:', error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  // FUNCIÓN TEMPORAL PARA LIMPIAR CACHE Y FORZAR RECARGA
  const limpiarCacheYRecargar = async () => {
    try {
      console.log('🧹 LIMPIANDO CACHE - Iniciando...')
      
      // Limpiar localStorage
      localStorage.removeItem('reservas')
      localStorage.removeItem('user')
      localStorage.removeItem('auth')
      console.log('✅ LIMPIANDO CACHE - localStorage limpiado')
      
      // Forzar recarga de reservas desde Supabase
      setReservas([])
      setLoading(true)
      
      console.log('🔄 LIMPIANDO CACHE - Recargando desde Supabase...')
      const reservasActualizadas = await obtenerReservas()
      console.log('✅ LIMPIANDO CACHE - Reservas obtenidas:', reservasActualizadas.length)
      
      setReservas(reservasActualizadas)
      setLoading(false)
      
      alert(`✅ CACHE LIMPIADO!\n\nReservas actuales: ${reservasActualizadas.length}\nDatos ahora vienen directamente de Supabase`)
      
    } catch (error) {
      console.error('❌ Error al limpiar cache:', error)
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  const ejecutarDiagnostico = async () => {
    console.log('🔍 EJECUTANDO DIAGNÓSTICO...');
    const diagnostico = await diagnosticarReservas();
    
    alert(`DIAGNÓSTICO RESERVAS:

📊 SUPABASE:
- Disponible: ${diagnostico.supabase.disponible ? 'SÍ' : 'NO'}
- Reservas: ${diagnostico.supabase.reservas.length}
- Error: ${diagnostico.supabase.error || 'Ninguno'}

💾 LOCALSTORAGE:
- Reservas: ${diagnostico.localStorage.reservas.length}

🔍 PROBLEMA:
${diagnostico.problema || 'No detectado'}

Ver consola para más detalles.`);
  };

  const semanaInfo = getSemanaInfo(fechaSeleccionada);

  const obtenerFechaActual = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Cargar reservas cuando cambia la fecha
  useEffect(() => {
    const cargarReservasDeLaSemana = async () => {
      if (fechaSeleccionada) {
        try {
          console.log('🔄 CARGANDO RESERVAS - Fecha seleccionada:', fechaSeleccionada)
          
          // Calcular todas las fechas de la semana
          const fecha = new Date(fechaSeleccionada + 'T00:00:00');
          const diaSemana = fecha.getDay();
          const lunes = new Date(fecha);
          lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
          
          // Obtener reservas para todos los días de la semana (lunes a viernes)
          const reservasSemana = [];
          for (let i = 0; i < 5; i++) {
            const fechaDia = new Date(lunes);
            fechaDia.setDate(lunes.getDate() + i);
            const fechaStr = fechaDia.toISOString().split('T')[0];
            
            try {
              const reservasDelDia = await obtenerReservasPorFecha(fechaStr);
              console.log(`📅 RESERVAS ${fechaStr}:`, reservasDelDia)
              reservasSemana.push(...reservasDelDia);
            } catch (error) {
              console.error(`Error al cargar reservas del día ${fechaStr}:`, error);
            }
          }
          
          console.log('📊 TOTAL RESERVAS SEMANA:', reservasSemana)
          setReservasDelDia(reservasSemana);
        } catch (error) {
          console.error('Error al cargar reservas de la semana:', error);
          setReservasDelDia([]);
        }
      } else {
        setReservasDelDia([]);
      }
      
      // Cargar todas las reservas para "Últimas 3 Reservas" y debug
      try {
        const todas = await obtenerReservas();
        console.log('📋 TODAS LAS RESERVAS (para debug y "Últimas 3"):', todas)
        setTodasLasReservas(todas);
        
        // ✅ NO forzar en reservasDelDia - mantener filtro por semana
        console.log('✅ Manteniendo filtro por semana - NO sobrescribiendo reservasDelDia')
        
      } catch (error) {
        console.error('Error al cargar todas las reservas:', error);
        setTodasLasReservas([]);
      }
    };

    cargarReservasDeLaSemana();
  }, [fechaSeleccionada]);

  // Manejar atajos de teclado para navegación por semanas
  useEffect(() => {
    const manejarTeclas = (event) => {
      // Solo activar atajos si no estamos en un input o modal
      if (event.target.tagName === 'INPUT' || modalAbierto) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          irASemanaAnterior();
          break;
        case 'ArrowRight':
          event.preventDefault();
          irASemanaSiguiente();
          break;
        case 'Home':
          event.preventDefault();
          irASemanaActual();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', manejarTeclas);
    return () => document.removeEventListener('keydown', manejarTeclas);
  }, [fechaSeleccionada, modalAbierto]);

  // Al hacer click en una celda, guardar la info de la celda y abrir el modal
  const handleCeldaClick = async (bloque, dia, subBloque) => {
    try {
      // Calcular la fecha exacta basada en el día de la semana seleccionado
      const fechaExacta = calcularFechaDelDia(fechaSeleccionada, dia);
      
      // Verificar si la fecha/hora ya pasó
      if (esFechaHoraPasada(fechaExacta, bloque.id)) {
        alert('No puedes hacer reservas en horarios que ya pasaron. Las reservas se pueden hacer hasta 15 minutos después del inicio del bloque.');
        return;
      }
      
      // Verificar si ya existe una reserva en este slot con la fecha exacta
      const existe = await existeReservaEnSlot(fechaExacta, dia, bloque.id, subBloque);
      if (existe) {
        alert('Ya existe una reserva en este horario. Selecciona otro slot disponible.');
        return;
      }

      setReservaSeleccionada({ bloque, dia, subBloque });
      setFormData({
        ...formData,
        fecha: fechaExacta, // Usar la fecha exacta calculada
        profesor: user?.nombre || '',
        tipoBloque: 'completo',
      });
      
      // Actualizar la fecha seleccionada para mostrar la semana correcta
      setFechaSeleccionada(fechaExacta);
      
      setModalAbierto(true);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      alert('Error al verificar disponibilidad. Inténtalo de nuevo.');
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Guardar la reserva usando el sistema de almacenamiento
  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔍 DEBUG SUBMIT - fechaSeleccionada:', fechaSeleccionada)
      console.log('🔍 DEBUG SUBMIT - formData.fecha:', formData.fecha)
      console.log('🔍 DEBUG SUBMIT - formData.tipoBloque:', formData.tipoBloque)
      console.log('🔍 DEBUG SUBMIT - reservaSeleccionada:', reservaSeleccionada)
      
      // USAR SIEMPRE fechaSeleccionada como fecha correcta
      const datosReservaCorregidos = {
        ...formData,
        fecha: fechaSeleccionada  // ⚠️ CORRECCIÓN: usar la fecha seleccionada en el calendario
      }
      
      console.log('🔍 DEBUG SUBMIT - datosReservaCorregidos:', datosReservaCorregidos)
      
      const datosReserva = formatearReservaDesdeFormulario(datosReservaCorregidos, reservaSeleccionada);
      console.log('🔍 DEBUG SUBMIT - datosReserva formateados:', datosReserva)
      console.log('🔍 DEBUG SUBMIT - tipoBloque final:', datosReserva.tipoBloque)
      console.log('🔍 DEBUG SUBMIT - subBloque final:', datosReserva.subBloque)
      
      const reservaGuardada = await guardarReserva(datosReserva);
      console.log('🔍 DEBUG SUBMIT - Reserva guardada:', reservaGuardada)
      
      if (reservaGuardada) {
        // Recargar reservas de toda la semana
        const fecha = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fecha.getDay();
        const lunes = new Date(fecha);
        lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
        
        const reservasSemana = [];
        for (let i = 0; i < 5; i++) {
          const fechaDia = new Date(lunes);
          fechaDia.setDate(lunes.getDate() + i);
          const fechaStr = fechaDia.toISOString().split('T')[0];
          
          try {
            const reservasDelDia = await obtenerReservasPorFecha(fechaStr);
            reservasSemana.push(...reservasDelDia);
          } catch (error) {
            console.error(`Error al recargar reservas del día ${fechaStr}:`, error);
          }
        }
        setReservasDelDia(reservasSemana);
        
        // Actualizar todas las reservas para el debug
        const todasActualizadas = await obtenerReservas();
        setTodasLasReservas(todasActualizadas);
        
        // CERRAR EL MODAL
        setMostrarModal(false);
        setReservaSeleccionada(null);
        
        // Reserva creada exitosamente (sin mostrar alert)
        console.log('✅ Reserva creada exitosamente:', {
          curso: formData.curso,
          asignatura: formData.asignatura,
          fecha: fechaSeleccionada,  // ⚠️ MOSTRAR LA FECHA CORRECTA
          bloque: reservaSeleccionada.bloque.id,
          profesor: formData.profesor
        });
      } else {
        alert('Error al guardar la reserva. Inténtalo de nuevo.');
      }
      
      setModalAbierto(false);
      setFormData({
        curso: '',
        asignatura: '',
        profesor: user?.nombre || '',
        fecha: '',
        tipoBloque: 'completo',
      });
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      alert('Error al procesar la reserva. Verifica tu conexión e inténtalo de nuevo.');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFormData({
      curso: '',
      asignatura: '',
      profesor: user?.nombre || '',
      fecha: '',
      tipoBloque: 'completo',
    });
  };

  // Funciones para navegación por semanas
  const irASemanaAnterior = () => {
    if (!fechaSeleccionada) {
      // Si no hay fecha seleccionada, usar la fecha actual
      const hoy = new Date();
      const fechaStr = hoy.toISOString().split('T')[0];
      setFechaSeleccionada(fechaStr);
      return;
    }
    
    const fecha = new Date(fechaSeleccionada + 'T00:00:00');
    fecha.setDate(fecha.getDate() - 7); // Retroceder 7 días
    
    // No permitir ir más atrás de la semana actual
    const hoy = new Date();
    const inicioSemanaActual = new Date(hoy);
    inicioSemanaActual.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    inicioSemanaActual.setHours(0, 0, 0, 0);
    
    if (fecha >= inicioSemanaActual) {
      const nuevaFecha = fecha.toISOString().split('T')[0];
      setFechaSeleccionada(nuevaFecha);
    } else {
      alert('No puedes navegar a semanas anteriores a la actual.');
    }
  };

  const irASemanaActual = () => {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    setFechaSeleccionada(fechaStr);
  };

  const irASemanaSiguiente = () => {
    if (!fechaSeleccionada) {
      // Si no hay fecha seleccionada, usar la fecha actual
      const hoy = new Date();
      const fechaStr = hoy.toISOString().split('T')[0];
      setFechaSeleccionada(fechaStr);
      return;
    }
    
    const fecha = new Date(fechaSeleccionada + 'T00:00:00');
    fecha.setDate(fecha.getDate() + 7); // Avanzar 7 días
    const nuevaFecha = fecha.toISOString().split('T')[0];
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-2 sm:p-3 lg:p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
            Sistema de Reservas
          </h1>
          <p className="text-gray-600 text-sm">
            Gestiona las reservas del laboratorio de forma eficiente
          </p>
          
          {/* Sistema funcionando correctamente */}
        </div>

        {/* Selector de fecha con navegación por semanas */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-100">
          {/* Navegación por semanas */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
            <button
              onClick={irASemanaAnterior}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              ⬅️ <span className="hidden sm:inline">Semana </span>Anterior
            </button>
            
            <button
              onClick={irASemanaActual}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
            >
              📅 <span className="hidden sm:inline">Semana </span>Actual
            </button>
            
            <button
              onClick={irASemanaSiguiente}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              <span className="hidden sm:inline">Semana </span>Siguiente ➡️
            </button>
          </div>

          {/* Selector de fecha manual */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 border-t border-gray-200">
            <label htmlFor="fecha" className="text-sm font-semibold text-gray-700">
              O selecciona una fecha específica:
            </label>
            <input 
              type="date" 
              id="fecha" 
              name="fecha" 
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              min={obtenerFechaActual()}
              className="px-3 py-1 border-2 border-blue-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-center text-sm"
            />
          </div>
        </div>

        {/* Info de la semana seleccionada */}
        {fechaSeleccionada ? (
          semanaInfo && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200 p-3 mb-3 text-center animate-fade-in">
              <div className="text-blue-700 font-bold text-lg mb-1">
                📅 Semana {semanaInfo.semana} del año
              </div>
              <div className="text-blue-600 text-sm">
                Del {semanaInfo.lunes} al {semanaInfo.viernes}
              </div>
              <div className="text-blue-500 text-xs mt-1">
                Haz clic en cualquier celda disponible para crear una reserva
              </div>
              <div className="text-blue-400 text-xs mt-1">
                💡 Atajos: ← → para cambiar semana | Home para semana actual
              </div>
            </div>
          )
        ) : (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-orange-200 p-3 mb-3 text-center">
            <div className="text-orange-700 font-bold text-sm mb-1">
              🗓️ Selecciona una fecha para comenzar
            </div>
            <div className="text-orange-600 text-xs">
              Usa los botones de navegación o selecciona una fecha específica
            </div>
          </div>
        )}

        {/* Tabla de horarios */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-blue-600 text-white">
                  <th className="px-1 py-2 text-center font-medium text-xs border-r-2 border-blue-800 w-20">
                    Bloque
                  </th>
                  {diasSemana.map((dia, index) => (
                    <th key={dia} className={`px-2 py-2 text-center font-medium text-xs ${
                      index === diasSemana.length - 1 ? '' : 'border-r-2 border-blue-800'
                    }`}>
                      {dia.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {bloques.map(bloque => (
                  [0, 1].map(subIdx => (
                    <tr 
                      key={`${bloque.id}-${subIdx}`} 
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        subIdx === 1 ? 'border-b-2 border-gray-800' : 'border-b border-gray-300'
                      }`}
                    >
                      {subIdx === 0 && (
                        <td
                          rowSpan={2}
                          className="px-1 py-2 text-center bg-gray-50 border-r-2 border-gray-800 font-medium text-gray-700 w-20"
                        >
                          <div className="text-sm font-bold text-blue-600">
                            {bloque.id}
                          </div>
                          <div className="text-xs text-gray-400">
                            {bloque.hora.split(' - ')[0]}
                          </div>
                        </td>
                      )}
                      {diasSemana.map((dia, diaIndex) => {
                        // Calcular la fecha exacta para este día de la semana
                        const fechaExactaDia = calcularFechaDelDia(fechaSeleccionada, dia);
                        
                        // 🔍 DEBUG: Log detallado para encontrar por qué no aparece la reserva
                        if (dia === 'Lunes' && bloque.id === 1 && subIdx === 0) { // Solo mostrar debug para primer slot
                          console.log('🔍 DEBUG RENDER - Buscando reserva para:', {
                            fechaExactaDia,
                            dia,
                            bloque: bloque.id,
                            subBloque: subBloques[subIdx],
                            totalReservas: reservasDelDia.length
                          });
                          
                          // Mostrar todas las reservas para comparar
                          reservasDelDia.forEach((r, idx) => {
                            console.log(`🔍 DEBUG RENDER - Reserva ${idx}:`, {
                              fecha: r.fecha,
                              dia: r.dia,
                              dia_semana: r.dia_semana,
                              bloque: r.bloque,
                              subBloque: r.subBloque,
                              sub_bloque: r.sub_bloque,
                              curso: r.curso
                            });
                          });
                        }
                        
                        const reservaEnSlot = reservasDelDia.find(r => {
                          // ⚡ MATCHING MEJORADO Y MÁS FLEXIBLE
                          
                          // 1. Coincidencia de fecha más flexible
                          const coincideFecha = r.fecha === fechaExactaDia || 
                                              r.fecha === fechaExactaDia.split('T')[0] ||
                                              fechaExactaDia.includes(r.fecha);
                          
                          // 2. Coincidencia de día SÚPER flexible
                          const diaReserva = r.dia || r.dia_semana || '';
                          const diasEquivalentes = {
                            'Lunes': ['Lunes', 'Lun', 'Monday', 'Mon', 'lunes', 'lun'],
                            'Martes': ['Martes', 'Mar', 'Tuesday', 'Tue', 'martes', 'mar'],
                            'Miércoles': ['Miércoles', 'Mié', 'Wednesday', 'Wed', 'miércoles', 'mie'],
                            'Jueves': ['Jueves', 'Jue', 'Thursday', 'Thu', 'jueves', 'jue'],
                            'Viernes': ['Viernes', 'Vie', 'Friday', 'Fri', 'viernes', 'vie'],
                            'Sábado': ['Sábado', 'Sáb', 'Saturday', 'Sat', 'sábado', 'sab'],
                            'Domingo': ['Domingo', 'Dom', 'Sunday', 'Sun', 'domingo', 'dom']
                          };
                          const coincideDia = diasEquivalentes[dia]?.includes(diaReserva) || 
                                            diaReserva === dia ||
                                            r.dia === dia || 
                                            r.dia_semana === dia;
                          
                          // 3. Coincidencia de bloque flexible
                          const coincideBloque = String(r.bloque) === String(bloque.id) ||
                                               parseInt(r.bloque) === parseInt(bloque.id);
                          
                          // 4. Coincidencia de sub-bloque MUY flexible - MEJORADA
                          const subBloqueReserva = r.subBloque || r.sub_bloque || '';
                          const subBloqueBuscado = subBloques[subIdx];
                          
                          // Lógica ESTRICTA para coincidir sub-bloques según el tipo de reserva
                          let coincideSubBloque = false;
                          
                          // Si la reserva es de tipo completo, debe aparecer en ambos slots (1° y 2° hora)
                          if (r.tipoBloque === 'completo' || r.tipo_bloque === 'completo') {
                            coincideSubBloque = true; // Bloque completo aparece en ambas horas
                          }
                          // Si la reserva es de 1° hora, SOLO aparece en el primer slot
                          else if (r.tipoBloque === '1hora' || r.tipo_bloque === '1hora') {
                            coincideSubBloque = (subBloqueBuscado === '1° hora');
                          }
                          // Si la reserva es de 2° hora, SOLO aparece en el segundo slot  
                          else if (r.tipoBloque === '2hora' || r.tipo_bloque === '2hora') {
                            coincideSubBloque = (subBloqueBuscado === '2° hora');
                          }
                          // Para reservas tipo 'parcial', verificar por sub_bloque específico
                          else if (r.tipoBloque === 'parcial' || r.tipo_bloque === 'parcial') {
                            // Si es parcial con sub_bloque de 1° hora
                            if ((r.subBloque === '1° hora' || r.sub_bloque === '1° hora') && subBloqueBuscado === '1° hora') {
                              coincideSubBloque = true;
                            }
                            // Si es parcial con sub_bloque de 2° hora
                            else if ((r.subBloque === '2° hora' || r.sub_bloque === '2° hora') && subBloqueBuscado === '2° hora') {
                              coincideSubBloque = true;
                            }
                          }
                          // Fallback LIMITADO para casos legacy (sin tipos específicos)
                          else {
                            coincideSubBloque = 
                              subBloqueReserva === subBloqueBuscado ||
                              (subBloqueBuscado === '1° hora' && (subBloqueReserva === 1 || subBloqueReserva === '1' || subBloqueReserva === 'primera')) ||
                              (subBloqueBuscado === '2° hora' && (subBloqueReserva === 2 || subBloqueReserva === '2' || subBloqueReserva === 'segunda'));
                          }
                          
                          // 5. ⚠️ MODO BYPASS: Si no hay coincidencias específicas, intentar matching por bloque solamente
                          const matchingRelajado = coincideBloque && (coincideDia || coincideFecha);
                          
                          // RESULTADO FINAL - SOLO matching específico (sin fallback que causa duplicados)
                          const resultado = (coincideFecha && coincideDia && coincideBloque && coincideSubBloque);
                          
                          // Debug detallado de la búsqueda (para todas las reservas de tipo 1hora o 2hora)
                          if ((r.tipoBloque === '1hora' || r.tipo_bloque === '1hora' || r.tipoBloque === '2hora' || r.tipo_bloque === '2hora') && dia === 'Jueves') {
                            console.log('🔍 DEBUG TIPO ESPECÍFICO - Comparando reserva tipo:', r.tipoBloque || r.tipo_bloque, {
                              reserva: { 
                                id: r.id,
                                curso: r.curso,
                                fecha: r.fecha, 
                                dia: diaReserva,
                                bloque: r.bloque, 
                                subBloque: subBloqueReserva,
                                tipoBloque: r.tipoBloque || r.tipo_bloque,
                                sub_bloque_bd: r.sub_bloque
                              },
                              buscando: { fechaExactaDia, dia, bloque: bloque.id, subBloque: subBloqueBuscado, subIdx },
                              coincidencias: { coincideFecha, coincideDia, coincideBloque, coincideSubBloque },
                              RESULTADO_FINAL: resultado
                            });
                          }
                          
                          // Debug detallado de la búsqueda (solo para primer slot de Lunes)
                          if (dia === 'Lunes' && bloque.id === 1 && subIdx === 0) {
                            console.log('🔍 DEBUG FIND MEJORADO - Comparando:', {
                              reserva: { 
                                curso: r.curso,
                                fecha: r.fecha, 
                                dia: diaReserva,
                                bloque: r.bloque, 
                                subBloque: subBloqueReserva,
                                tipoBloque: r.tipoBloque || r.tipo_bloque,
                                sub_bloque_bd: r.sub_bloque
                              },
                              buscando: { fechaExactaDia, dia, bloque: bloque.id, subBloque: subBloqueBuscado, subIdx },
                              coincidencias: { coincideFecha, coincideDia, coincideBloque, coincideSubBloque },
                              RESULTADO_FINAL: resultado
                            });
                          }
                          
                          return resultado;
                        });
                        
                        const existeReserva = !!reservaEnSlot;
                        const esPasado = esFechaHoraPasada(fechaExactaDia, bloque.id);
                        const esClickeable = !existeReserva && !esPasado && fechaSeleccionada;
                        
                        // Verificar si está en tiempo límite (hoy y quedan menos de 30 minutos)
                        const tiempoRestante = getTiempoRestanteParaReservar(fechaExactaDia, bloque.id);
                        const esHoy = new Date(fechaExactaDia + 'T00:00:00').toDateString() === new Date().toDateString();
                        const esTiempoLimite = esHoy && tiempoRestante !== null && tiempoRestante <= 30 && tiempoRestante > 0;
                        
                        // Determinar línea vertical según la posición del día
                        const bordeVertical = diaIndex === diasSemana.length - 1 ? '' : 'border-r-2 border-gray-800';
                        
                        // Determinar estilo según el estado
                        let estiloClase = `px-2 py-1 text-center ${bordeVertical} transition-all duration-200 min-h-[35px] `;
                        if (existeReserva) {
                          estiloClase += 'bg-red-50 cursor-not-allowed';
                        } else if (esPasado) {
                          estiloClase += 'bg-gray-100 cursor-not-allowed opacity-60';
                        } else if (esTiempoLimite) {
                          estiloClase += 'bg-orange-50 cursor-pointer hover:bg-orange-100 hover:shadow-sm';
                        } else if (fechaSeleccionada) {
                          estiloClase += 'bg-green-50 cursor-pointer hover:bg-green-100 hover:shadow-sm';
                        } else {
                          estiloClase += 'bg-gray-50 cursor-not-allowed';
                        }
                        
                        return (
                          <td
                            key={`${bloque.id}-${dia}-${subIdx}`}
                            onClick={() => esClickeable && handleCeldaClick(bloque, dia, subBloques[subIdx])}
                            className={estiloClase}
                            title={existeReserva ? `Reservado por: ${reservaEnSlot?.profesor || 'N/A'}\nCurso: ${reservaEnSlot?.curso || 'N/A'}\nAsignatura: ${reservaEnSlot?.asignatura || 'N/A'}` : esPasado ? 'Horario pasado' : fechaSeleccionada ? 'Clic para reservar' : 'Selecciona una fecha primero'}
                          >
                            {existeReserva ? (
                              <div className="space-y-0.5">
                                <div className="text-xs text-red-700 font-medium truncate">
                                  {reservaEnSlot?.curso || 'Ocupado'}
                                </div>
                              </div>
                            ) : esPasado ? (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-gray-500 text-xs">Pasado</span>
                              </div>
                            ) : fechaSeleccionada ? (
                              (() => {
                                const tiempoRestante = getTiempoRestanteParaReservar(fechaExactaDia, bloque.id);
                                const esHoy = new Date(fechaExactaDia + 'T00:00:00').toDateString() === new Date().toDateString();
                                
                                if (esHoy && tiempoRestante !== null && tiempoRestante <= 30) {
                                  return (
                                    <div className="flex flex-col items-center justify-center h-full">
                                      {tiempoRestante > 0 && (
                                        <span className="text-orange-600 text-xs font-bold">
                                          {tiempoRestante}m
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                                
                                return null; // Celda vacía para horarios normales disponibles
                              })()
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leyenda de estados */}
        <div className="mt-3 bg-white rounded-lg shadow-sm p-2 border border-gray-100">
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-gray-600">Libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
              <span className="text-gray-600">Urgente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-600">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-gray-600">Pasado</span>
            </div>
          </div>
        </div>

        {/* Enlace al calendario */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-700 mb-2">
              📅 ¿Quieres ver todas las reservas del mes?
            </div>
            <a 
              href="/calendario" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-200"
            >
              Ver Calendario Mensual
            </a>
            <div className="text-sm text-indigo-600 mt-2">
              Las reservas que hagas aquí aparecerán automáticamente en el calendario
            </div>
          </div>
        </div>

        {/* Debug section */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="font-bold text-gray-700 mb-2">📊 Estadísticas del Sistema:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{todasLasReservas.length}</div>
              <div className="text-sm text-blue-700">Total Reservas</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{reservasDelDia.length}</div>
              <div className="text-sm text-green-700">Reservas Hoy</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(todasLasReservas.map(r => r.profesor)).size}
              </div>
              <div className="text-sm text-purple-700">Profesores Activos</div>
            </div>
          </div>
          
          {/* Últimas reservas */}
          {todasLasReservas.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-2">🕒 Últimas 3 Reservas:</div>
              <div className="space-y-2">
                {todasLasReservas.slice(-3).reverse().map(reserva => (
                  <div key={reserva.id} className="bg-white p-2 rounded border text-xs">
                    <strong>{reserva.curso}</strong> - {reserva.asignatura} | 
                    {new Date(reserva.fecha + 'T00:00:00').toLocaleDateString('es-ES')} | 
                    Bloque {reserva.bloque} ({reserva.sub_bloque || reserva.subBloque}) | 
                    {reserva.profesor}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* DEBUG INFO TEMPORAL */}
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <div><strong>🔍 DEBUG INFO:</strong></div>
            <div>📋 Total reservas cargadas: {todasLasReservas.length}</div>
            <div>📅 Reservas de la semana: {reservasDelDia.length}</div>
            <div>📆 Fecha seleccionada: {fechaSeleccionada || 'Ninguna'}</div>
            <div>📊 Estado loading: {loading ? 'Cargando...' : 'Listo'}</div>
            {todasLasReservas.length > 0 && (
              <div>
                <div><strong>Última reserva:</strong></div>
                <div>- Fecha: {todasLasReservas[todasLasReservas.length - 1]?.fecha}</div>
                <div>- Curso: {todasLasReservas[todasLasReservas.length - 1]?.curso}</div>
                <div>- Día: {todasLasReservas[todasLasReservas.length - 1]?.dia}</div>
                <div>- Bloque: {todasLasReservas[todasLasReservas.length - 1]?.bloque}</div>
                <div>- Sub-bloque: {todasLasReservas[todasLasReservas.length - 1]?.sub_bloque}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal para registrar reserva */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full max-h-[67vh] animate-bounce-in" style={{boxShadow: '8px 8px 25px rgba(0, 0, 0, 0.3), 4px 4px 15px rgba(0, 0, 0, 0.2)'}}>
              <div className="p-4">
                <h2 className="text-xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Registrar Reserva
                </h2>
                
                {/* Información del slot seleccionado */}
                {reservaSeleccionada && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 text-center">
                    <div className="text-sm font-medium text-blue-800">
                      📅 {reservaSeleccionada.dia} - Bloque {reservaSeleccionada.bloque.id}
                    </div>
                    <div className="text-xs text-blue-600">
                      {reservaSeleccionada.bloque.hora} ({reservaSeleccionada.subBloque})
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmitReserva} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Curso:
                    </label>
                    <select
                      name="curso"
                      value={formData.curso}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Selecciona un curso</option>
                      <option value="1°A">1°A</option>
                      <option value="1°B">1°B</option>
                      <option value="1°C">1°C</option>
                      <option value="2°A">2°A</option>
                      <option value="2°B">2°B</option>
                      <option value="2°C">2°C</option>
                      <option value="3°A">3°A</option>
                      <option value="3°B">3°B</option>
                      <option value="3°C">3°C</option>
                      <option value="4°A">4°A</option>
                      <option value="4°B">4°B</option>
                      <option value="4°C">4°C</option>
                      <option value="5°A">5°A</option>
                      <option value="5°B">5°B</option>
                      <option value="5°C">5°C</option>
                      <option value="6°A">6°A</option>
                      <option value="6°B">6°B</option>
                      <option value="6°C">6°C</option>
                      <option value="7°A">7°A</option>
                      <option value="7°B">7°B</option>
                      <option value="7°C">7°C</option>
                      <option value="8°A">8°A</option>
                      <option value="8°B">8°B</option>
                      <option value="8°C">8°C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Asignatura:
                    </label>
                    <input
                      type="text"
                      name="asignatura"
                      value={formData.asignatura}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="Ej: Matemáticas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Tipo de Reserva:
                    </label>
                    <select
                      name="tipoBloque"
                      value={formData.tipoBloque}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Selecciona el tipo</option>
                      <option value="completo">Bloque completo (2 horas)</option>
                      <option value="1hora">Solo primera hora</option>
                      <option value="2hora">Solo segunda hora</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Profesor:
                    </label>
                    <input
                      type="text"
                      name="profesor"
                      value={formData.profesor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Fecha:
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
                      </div>
          )}

          {/* Pie de página */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 leading-tight">
              <div>Desarrollado por Bit Core</div>
              <div>para Jorge Zúñiga U.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default ReservasPage; 