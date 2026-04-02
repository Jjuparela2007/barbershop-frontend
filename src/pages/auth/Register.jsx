import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm]             = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate                    = useNavigate()
  const { user, login }             = useAuth()

  useEffect(() => {
    if (user) navigate('/client')
  }, [user])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
      const res  = await fetch(`${BASE}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      navigate('/login')
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: '#ffffff',
    border: '1px solid rgba(201,168,76,0.3)',
    color: '#1a1a1a', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.3s',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.7rem',
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: '#666', marginBottom: '8px',
  }

  const fields = [
    { name: 'name',  label: 'Nombre completo',    type: 'text',  placeholder: 'Juan García',      required: true  },
    { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com',     required: true  },
    { name: 'phone', label: 'Teléfono (opcional)', type: 'tel',  placeholder: '+57 300 123 4567', required: false },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 5% 60px',
      position: 'relative',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)',
      }}/>

      {/* Línea vertical decorativa */}
      <div style={{
        position: 'absolute', left: '5%', top: '10%', bottom: '10%',
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
        opacity: 0.4,
      }}/>

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="animate-fade-up delay-100" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '48px', height: '48px',
              border: '1px solid var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', color: 'var(--gold)',
            }}>✂</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#1a1a1a', letterSpacing: '0.1em' }}>
              AJ Barber Shop
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="animate-fade-up delay-200" style={{
          background: '#f9f9f7',
          border: '1px solid rgba(201,168,76,0.2)',
          padding: '48px 40px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ marginBottom: '36px' }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              ✦ Únete a nosotros
            </span>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.8rem', fontWeight: '700',
              color: '#1a1a1a', marginTop: '12px',
            }}>Crear Cuenta</h1>
          </div>

          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.3)',
              padding: '12px 16px', marginBottom: '24px',
              fontSize: '0.85rem', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Campos normales */}
            {fields.map(field => (
              <div key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(201,168,76,0.3)'}
                />
              </div>
            ))}

            {/* Contraseña con ojito */}
            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(201,168,76,0.3)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px', color: '#999', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#999'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading}
              style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }}/>
            <span style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em' }}>O</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }}/>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Volver */}
        <div className="animate-fade-up delay-300" style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{
            fontSize: '0.75rem', color: '#999',
            textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}