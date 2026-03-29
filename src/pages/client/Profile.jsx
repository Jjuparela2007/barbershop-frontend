import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Profile() {
  const { user, login } = useAuth()

  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  })

  const [msgInfo, setMsgInfo]   = useState('')
  const [msgPass, setMsgPass]   = useState('')
  const [saving,  setSaving]    = useState(false)
  const [savingP, setSavingP]   = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password:     false,
    confirm_password: false,
  })

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--black-card)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  }

  const handleSaveInfo = async () => {
    setSaving(true)
    setMsgInfo('')
    try {
      const { data } = await api.put('/users/me', {
        name:  form.name,
        email: form.email,
        phone: form.phone,
      })
      login(data.data.user, localStorage.getItem('token'))
      setMsgInfo('✓ Información actualizada correctamente')
    } catch (err) {
      setMsgInfo('✗ ' + (err.response?.data?.error || 'Error al guardar'))
    } finally { setSaving(false) }
  }

  const handleSavePass = async () => {
    if (passForm.new_password !== passForm.confirm_password) {
      setMsgPass('✗ Las contraseñas no coinciden')
      return
    }
    if (passForm.new_password.length < 6) {
      setMsgPass('✗ La contraseña debe tener al menos 6 caracteres')
      return
    }
    setSavingP(true)
    setMsgPass('')
    try {
      await api.put('/users/me/password', {
        current_password: passForm.current_password,
        new_password:     passForm.new_password,
      })
      setMsgPass('✓ Contraseña actualizada correctamente')
      setPassForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setMsgPass('✗ ' + (err.response?.data?.error || 'Error al cambiar contraseña'))
    } finally { setSavingP(false) }
  }

  const EyeIcon = ({ visible }) => visible ? (
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
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--black-soft)', borderBottom: '1px solid var(--border)', padding: '24px 5%' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="section-label">✦ Mi cuenta</span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', marginTop: '8px' }}>
              Mi Perfil
            </h1>
          </div>
          <Link to="/client">
            <button className="btn-outline" style={{ padding: '10px 20px' }}>← Volver</button>
          </Link>
        </div>
      </div>

      <div className="mobile-padding" style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 5%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--black)',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>
              Cliente
            </div>
          </div>
        </div>

        {/* Información personal */}
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '24px' }}>
            Información Personal
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'name',  label: 'Nombre completo', type: 'text'  },
              { key: 'email', label: 'Correo',           type: 'email' },
              { key: 'phone', label: 'Teléfono',         type: 'tel'   },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                  {f.label}
                </label>
                <input type={f.type} value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            {msgInfo && (
              <div style={{
                padding: '10px 14px', fontSize: '0.82rem',
                background: msgInfo.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                border: `1px solid ${msgInfo.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
                color: msgInfo.startsWith('✓') ? '#6ee7b7' : '#fc8181',
              }}>{msgInfo}</div>
            )}

            <button className="btn-gold" onClick={handleSaveInfo} disabled={saving}
              style={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '24px' }}>
            Cambiar Contraseña
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'current_password', label: 'Contraseña actual',   placeholder: '••••••••' },
              { key: 'new_password',     label: 'Nueva contraseña',     placeholder: 'Mínimo 6 caracteres' },
              { key: 'confirm_password', label: 'Confirmar contraseña', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                  {f.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords[f.key] ? 'text' : 'password'}
                    value={passForm[f.key]}
                    onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px', color: 'var(--white-muted)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--white-muted)'}
                    aria-label={showPasswords[f.key] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon visible={showPasswords[f.key]} />
                  </button>
                </div>
              </div>
            ))}

            {msgPass && (
              <div style={{
                padding: '10px 14px', fontSize: '0.82rem',
                background: msgPass.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                border: `1px solid ${msgPass.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,34,0.3)'}`,
                color: msgPass.startsWith('✓') ? '#6ee7b7' : '#fc8181',
              }}>{msgPass}</div>
            )}

            <button className="btn-gold" onClick={handleSavePass} disabled={savingP}
              style={{ alignSelf: 'flex-start', opacity: savingP ? 0.7 : 1 }}>
              {savingP ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}