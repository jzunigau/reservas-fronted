import React from 'react'

const EnvDebugPage = () => {
  console.log('🔍 ENV DEBUG - Todas las variables process.env:', process.env)
  
  const allEnvVars = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key]
      return obj
    }, {})
  
  console.log('🔍 ENV DEBUG - Variables REACT_APP:', allEnvVars)

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Environment Variables Debug</h1>
      
      <h2>📋 Variables REACT_APP_*:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ccc' }}>
        {JSON.stringify(allEnvVars, null, 2)}
      </pre>
      
      <h2>🎯 Variables Específicas:</h2>
      <div style={{ background: '#f9f9f9', padding: '15px', border: '1px solid #ddd' }}>
        <p><strong>REACT_APP_SUPABASE_URL:</strong> {process.env.REACT_APP_SUPABASE_URL || 'undefined'}</p>
        <p><strong>REACT_APP_SUPABASE_ANON_KEY:</strong> {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET (oculto)' : 'undefined'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</p>
        <p><strong>REACT_APP_ENVIRONMENT:</strong> {process.env.REACT_APP_ENVIRONMENT || 'undefined'}</p>
      </div>
      
      <h2>🌐 Información del Build:</h2>
      <div style={{ background: '#e8f4f8', padding: '15px', border: '1px solid #bee5eb' }}>
        <p><strong>window.location.href:</strong> {window.location.href}</p>
        <p><strong>window.location.hostname:</strong> {window.location.hostname}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      </div>
      
      <h2>🔗 Process.env completo:</h2>
      <details>
        <summary>Expandir para ver todas las variables</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ccc', fontSize: '12px' }}>
          {JSON.stringify(process.env, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default EnvDebugPage
