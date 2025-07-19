#!/usr/bin/env node

// Script para verificar configuración de variables de entorno
console.log('🔍 VERCEL ENV CHECK - Verificando configuración...')

const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
]

console.log('\n📋 Variables requeridas:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  const display = value ? (varName.includes('KEY') ? 'SET (oculto)' : value) : 'undefined'
  console.log(`${status} ${varName}: ${display}`)
})

console.log('\n🌐 Información del entorno:')
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`)
console.log(`- VERCEL: ${process.env.VERCEL || 'undefined'}`)
console.log(`- VERCEL_ENV: ${process.env.VERCEL_ENV || 'undefined'}`)
console.log(`- VERCEL_URL: ${process.env.VERCEL_URL || 'undefined'}`)

console.log('\n📦 Todas las variables REACT_APP_*:')
Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .forEach(key => {
    const value = process.env[key]
    const display = key.includes('KEY') ? 'SET (oculto)' : value
    console.log(`- ${key}: ${display}`)
  })

// Verificar si estamos en build time vs runtime
console.log('\n⏰ Contexto de ejecución:')
console.log('- Script ejecutado en:', new Date().toISOString())
console.log('- Current working directory:', process.cwd())

if (process.env.VERCEL) {
  console.log('\n🚀 Información de Vercel:')
  console.log(`- Deployment URL: ${process.env.VERCEL_URL}`)
  console.log(`- Git commit: ${process.env.VERCEL_GIT_COMMIT_SHA || 'undefined'}`)
  console.log(`- Git branch: ${process.env.VERCEL_GIT_COMMIT_REF || 'undefined'}`)
}
