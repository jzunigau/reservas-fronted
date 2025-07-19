import React, { useState } from 'react'

const JWTDecoderPage = () => {
  const [jwtToken, setJwtToken] = useState('')
  const [decoded, setDecoded] = useState(null)
  const [error, setError] = useState('')

  const decodeJWT = (token) => {
    try {
      setError('')
      if (!token) {
        setDecoded(null)
        return
      }

      // JWT tiene 3 partes separadas por puntos
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido')
      }

      // Decodificar la parte del payload (segunda parte)
      const payload = parts[1]
      
      // Agregar padding si es necesario
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)
      
      // Decodificar de base64
      const decodedPayload = atob(paddedPayload)
      const parsedPayload = JSON.parse(decodedPayload)
      
      setDecoded(parsedPayload)
    } catch (err) {
      setError(`Error decodificando JWT: ${err.message}`)
      setDecoded(null)
    }
  }

  React.useEffect(() => {
    // Pre-llenar con el token del .env si está disponible
    const envToken = process.env.REACT_APP_SUPABASE_ANON_KEY
    if (envToken) {
      setJwtToken(envToken)
      decodeJWT(envToken)
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h1>🔍 JWT Token Decoder</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          JWT Token (REACT_APP_SUPABASE_ANON_KEY):
        </label>
        <textarea
          value={jwtToken}
          onChange={(e) => {
            setJwtToken(e.target.value)
            decodeJWT(e.target.value)
          }}
          placeholder="Pega aquí tu JWT token..."
          style={{ 
            width: '100%', 
            height: '100px', 
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        />
      </div>

      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '10px', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {decoded && (
        <div>
          <h2>📋 Payload Decodificado:</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(decoded, null, 2)}
          </pre>

          {decoded.ref && (
            <div style={{ 
              background: '#e8f4f8', 
              padding: '15px', 
              border: '1px solid #bee5eb',
              borderRadius: '4px',
              marginTop: '15px'
            }}>
              <h3>🎯 URL Correcta de Supabase:</h3>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#0066cc',
                wordBreak: 'break-all'
              }}>
                https://{decoded.ref}.supabase.co
              </p>
            </div>
          )}

          {decoded.iss && (
            <div style={{ 
              background: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '15px'
            }}>
              <h3>ℹ️ Información Adicional:</h3>
              <p><strong>Issuer:</strong> {decoded.iss}</p>
              <p><strong>Role:</strong> {decoded.role}</p>
              {decoded.iat && <p><strong>Issued At:</strong> {new Date(decoded.iat * 1000).toLocaleString()}</p>}
              {decoded.exp && <p><strong>Expires At:</strong> {new Date(decoded.exp * 1000).toLocaleString()}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JWTDecoderPage
