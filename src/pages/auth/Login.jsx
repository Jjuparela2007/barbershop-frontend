import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const { user, login }       = useAuth()

  // Si ya está logueado, redirigir al panel
  useEffect(() => {
    if (user) {
      if (user.role === 'admin')       navigate('/admin')
      else if (user.role === 'barber') navigate('/barber')
      else {
  const preselected = localStorage.getItem('preselected_barber')
  navigate(preselected ? '/client/book' : '/client')
}
    }
  }, [user])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
    const res  = await fetch(`${BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()
    if (!data.success) { setError(data.error); return }
    login(data.data.user, data.data.token)
    const { role } = data.data.user
    if (role === 'admin')       navigate('/admin')
    else if (role === 'barber') navigate('/barber')
    else {
      const preselected = localStorage.getItem('preselected_barber')
      navigate(preselected ? '/client/book' : '/client')
    }
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
    color: '#1a1a1a', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 5%', position: 'relative',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)',
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
              BARBERSHOP
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
              ✦ Bienvenido de vuelta
            </span>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.8rem', fontWeight: '700',
              color: '#1a1a1a', marginTop: '12px',
            }}>Iniciar Sesión</h1>
          </div>

          {/* Error */}
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
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="tu@email.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(201,168,76,0.3)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Contraseña
              </label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(201,168,76,0.3)'}
              />
            </div>

            <button type="submit" className="btn-gold" disabled={loading}
              style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }}/>
            <span style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em' }}>O</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }}/>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '500' }}>
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Volver */}
        <div className="animate-fade-up delay-300" style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
