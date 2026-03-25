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
      // Actualizar el contexto con los nuevos datos
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
              { key: 'current_password', label: 'Contraseña actual',    placeholder: '••••••••' },
              { key: 'new_password',     label: 'Nueva contraseña',      placeholder: 'Mínimo 6 caracteres' },
              { key: 'confirm_password', label: 'Confirmar contraseña',  placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                  {f.label}
                </label>
                <input type="password" value={passForm[f.key]}
                  onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
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