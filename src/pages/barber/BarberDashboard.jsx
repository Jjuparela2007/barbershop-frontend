import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatDate } from '../../utils/dateFormat'

const STATUS_LABEL = {
  pending:     { label: 'Pendiente',  color: '#F59E0B' },
  confirmed:   { label: 'Confirmada', color: '#10B981' },
  in_progress: { label: 'En curso',   color: '#3B82F6' },
  completed:   { label: 'Completada', color: '#6B7280' },
  cancelled:   { label: 'Cancelada',  color: '#EF4444' },
  no_show:     { label: 'No asistió', color: '#EF4444' },
}

const NEXT_STATUS = {
  pending:     'confirmed',
  confirmed:   'in_progress',
  in_progress: 'completed',
}

const NEXT_LABEL = {
  pending:     'Confirmar',
  confirmed:   'Iniciar',
  in_progress: 'Completar',
}

export default function BarberDashboard() {
  const { user, logout }                = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('today')
  const [section, setSection]           = useState('appointments')
  const [successMsg, setSuccessMsg]     = useState('')
  const navigate                        = useNavigate()

  useEffect(() => { fetchAppointments() }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'today') params.date = new Date().toISOString().split('T')[0]
      const { data } = await api.get(`/appointments/barber/${user.id}`, { params })
      setAppointments(data.data.appointments)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus })
      fetchAppointments()
      if (newStatus === 'completed') {
        setSuccessMsg('✓ Cita completada exitosamente')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch { alert('No se pudo actualizar el estado') }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const pending     = appointments.filter(a => a.status === 'pending')
  const confirmed   = appointments.filter(a => a.status === 'confirmed')
  const in_progress = appointments.filter(a => a.status === 'in_progress')
  const done        = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status))

  const navButtons = [
    { key: 'appointments', label: '📋 Citas'        },
    { key: 'walkin',       label: '⚡ Venta Directa' },
    { key: 'gallery',      label: '🖼 Galería'       },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--black-soft)', borderBottom: '1px solid var(--border)', padding: '24px 5%' }}>
        <div className="panel-header" style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <span className="section-label">✦ Panel de barbero</span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', marginTop: '8px' }}>
              Hola, <span style={{ color: 'var(--gold)' }}>{user?.name?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="panel-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {navButtons.map(btn => (
              <button key={btn.key}
                className={section === btn.key ? 'btn-gold' : 'btn-outline'}
                onClick={() => setSection(btn.key)}
                style={{ padding: '10px 16px', fontSize: '0.78rem', flex: 1 }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mobile-padding" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 5%' }}>

        {/* Sección citas */}
        {section === 'appointments' && (
          <>
            {/* Stats */}
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2px', marginBottom: '40px',
            }}>
              {[
                { label: 'Total hoy',   value: appointments.length },
                { label: 'Pendientes',  value: pending.length },
                { label: 'Confirmadas', value: confirmed.length },
                { label: 'Completadas', value: appointments.filter(a => a.status === 'completed').length },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '24px' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: '700' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {[{ key: 'today', label: 'Hoy' }, { key: 'all', label: 'Todas' }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={filter === f.key ? 'btn-gold' : 'btn-outline'}
                  style={{ padding: '10px 24px', fontSize: '0.75rem' }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Mensaje de éxito */}
            {successMsg && (
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                padding: '14px 20px', marginBottom: '24px',
                fontSize: '0.88rem', color: '#6ee7b7',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {successMsg}
                <button onClick={() => setSuccessMsg('')}
                  style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
            )}

            {loading ? (
              <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando citas...</p>
            ) : appointments.length === 0 ? (
              <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>✂</div>
                <p style={{ color: 'var(--white-muted)' }}>No hay citas {filter === 'today' ? 'para hoy' : 'registradas'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {pending.length > 0 && (
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '16px' }}>
                      Pendientes de confirmar
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {pending.map(appt => <BarberAppointmentCard key={appt.id} appt={appt} onUpdate={handleUpdateStatus} />)}
                    </div>
                  </div>
                )}
                {confirmed.length > 0 && (
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '16px' }}>
                      Confirmadas
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {confirmed.map(appt => <BarberAppointmentCard key={appt.id} appt={appt} onUpdate={handleUpdateStatus} />)}
                    </div>
                  </div>
                )}
                {in_progress.length > 0 && (
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#3B82F6', marginBottom: '16px' }}>
                      ✂ En curso
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {in_progress.map(appt => <BarberAppointmentCard key={appt.id} appt={appt} onUpdate={handleUpdateStatus} />)}
                    </div>
                  </div>
                )}
                {done.length > 0 && (
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '16px' }}>
                      Finalizadas
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {done.map(appt => <BarberAppointmentCard key={appt.id} appt={appt} onUpdate={handleUpdateStatus} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {section === 'walkin'  && <WalkInSale  barberId={user.id} />}
        {section === 'gallery' && <GalleryManager barberId={user.id} />}
      </div>
    </div>
  )
}

function BarberAppointmentCard({ appt, onUpdate }) {
  const status    = STATUS_LABEL[appt.status] || { label: appt.status, color: '#6B7280' }
  const nextSt    = NEXT_STATUS[appt.status]
  const nextLabel = NEXT_LABEL[appt.status]

  return (
    <div className="appt-card" style={{
      background: 'var(--black-card)', border: '1px solid var(--border)',
      padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: '16px', transition: 'border-color 0.3s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Fecha y hora */}
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border)', padding: '10px 12px', textAlign: 'center', minWidth: '70px' }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {formatDate(appt.appointment_date).day} {formatDate(appt.appointment_date).num} {formatDate(appt.appointment_date).mon}
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)', marginTop: '4px' }}>
            {appt.start_time?.slice(0,5)}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--white-muted)', marginTop: '2px' }}>
            {appt.end_time?.slice(0,5)}
          </div>
        </div>

        {/* Info cliente */}
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '4px' }}>
            {appt.client_name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--white-muted)' }}>
            {appt.service_name} · {appt.duration_minutes} min
          </div>
          {appt.client_phone && (
            <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '2px' }}>
              📞 {appt.client_phone}
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="appt-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ padding: '4px 10px', border: `1px solid ${status.color}33`, background: `${status.color}11`, fontSize: '0.68rem', color: status.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {status.label}
        </div>
        {nextSt && (
          <button className="btn-gold" onClick={() => onUpdate(appt.id, nextSt)}
            style={{ padding: '8px 14px', fontSize: '0.72rem' }}>
            {nextLabel}
          </button>
        )}
        {appt.status === 'confirmed' && (
          <button onClick={() => onUpdate(appt.id, 'no_show')}
            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', padding: '6px 10px', fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s' }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.target.style.background = 'none'}>
            No asistió
          </button>
        )}
      </div>
    </div>
  )
}

function WalkInSale({ barberId }) {
  const [services, setServices] = useState([])
  const [form, setForm]         = useState({ service_id: '', client_name: '', notes: '' })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState('')
  const [history, setHistory]   = useState([])

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.data.services))
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await api.get(`/appointments/walk-in/${barberId}`, { 
      params: { date: today } 
    })
    setHistory(data.data.appointments) // Ya no necesitas filtrar porque el backend solo devuelve walk-in
  } catch (err) { 
    console.error(err) 
  }
}

  const handleSubmit = async () => {
    if (!form.service_id)  { setError('Selecciona un servicio'); return }
    if (!form.client_name) { setError('Ingresa el nombre del cliente'); return }
    setLoading(true)
    setError('')
    setSuccess(null)
    try {
      const { data } = await api.post('/appointments/walk-in', form)
      setSuccess(data.data.appointment)
      setForm({ service_id: '', client_name: '', notes: '' })
      fetchHistory() // Recargar historial después de crear
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la venta')
    } finally { setLoading(false) }
  }

  const selectedService = services.find(s => s.id == form.service_id)
  const totalHoy = history.reduce((sum, a) => sum + Number(a.price || 0), 0)

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'var(--black-card)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.88rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  return (
    <div>
      <span className="section-label">✦ Sin reserva</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)', margin: '8px 0 32px' }}>
        Venta Directa
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Formulario */}
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '20px' }}>
            Registrar cliente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
                Nombre del cliente
              </label>
              <input type="text" value={form.client_name}
                onChange={e => setForm({ ...form, client_name: e.target.value })}
                placeholder="Ej: Pedro Ramírez" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
                Servicio
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {services.map(s => (
                  <div key={s.id} onClick={() => setForm({ ...form, service_id: s.id })}
                    style={{
                      padding: '12px 14px', cursor: 'pointer',
                      background: form.service_id == s.id ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.service_id == s.id ? 'var(--gold)' : 'var(--border)'}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                    }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)', marginTop: '2px' }}>⏱ {s.duration_minutes} min</div>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--gold)' }}>
                      ${Number(s.price).toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
                Notas (opcional)
              </label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: Fade bajo, barba corta" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {selectedService && (
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border)', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>Servicio</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{selectedService.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>Total</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)' }}>
                    ${Number(selectedService.price).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '10px 14px', fontSize: '0.82rem', color: '#fc8181' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', color: '#6ee7b7', marginBottom: '4px' }}>✓ Venta registrada</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>
                  {success.service_name} · ${Number(success.price).toLocaleString('es-CO')}
                </div>
              </div>
            )}

            <button className="btn-gold" onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Registrando...' : '⚡ Registrar Venta'}
            </button>
          </div>
        </div>

        {/* Historial del día */}
        <div>
          <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--white-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Total hoy
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: '700' }}>
                ${totalHoy.toLocaleString('es-CO')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)' }}>{history.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>clientes</div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '12px' }}>
            Registro del día
          </h3>

          {history.length === 0 ? (
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin ventas directas hoy</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {history.map((a, i) => (
                <div key={a.id} style={{
                  background: 'var(--black-card)', border: '1px solid var(--border)',
                  padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px',
                      background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Playfair Display, serif', fontSize: '0.8rem', color: 'var(--gold)',
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--white)', marginBottom: '2px' }}>
                        {a.client_name || a.notes?.replace('Walk-in: ', '').split(' - ')[0] || 'Cliente'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)' }}>
                        {a.service_name} · {a.start_time?.slice(0,5)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--gold)' }}>
                    ${Number(a.price).toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GalleryManager({ barberId }) {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ image_url: '', caption: '' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => { fetchGallery() }, [])

  const fetchGallery = async () => {
    try {
      const { data } = await api.get(`/barbers/${barberId}/gallery`)
      setGallery(data.data.gallery)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!form.image_url) { setError('La URL de la imagen es obligatoria'); return }
    setSaving(true)
    setError('')
    try {
      await api.post(`/barbers/${barberId}/gallery`, form)
      setForm({ image_url: '', caption: '' })
      fetchGallery()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar imagen')
    } finally { setSaving(false) }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await api.delete(`/barbers/${barberId}/gallery/${imageId}`)
      fetchGallery()
    } catch { alert('No se pudo eliminar') }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'var(--black-card)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.88rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  return (
    <div>
      <span className="section-label">✦ Mi galería</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)', margin: '8px 0 32px' }}>
        Gestionar Galería
      </h2>

      <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '16px' }}>
          Agregar nueva imagen
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
              URL de la imagen *
            </label>
            <input type="url" value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://ejemplo.com/foto.jpg" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
              Descripción (opcional)
            </label>
            <input type="text" value={form.caption}
              onChange={e => setForm({ ...form, caption: e.target.value })}
              placeholder="Ej: Degradado clásico con barba" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {form.image_url && (
            <div style={{ width: '100px', height: '100px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <img src={form.image_url} alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.style.display = 'none'}
              />
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '10px 14px', fontSize: '0.82rem', color: '#fc8181' }}>
              {error}
            </div>
          )}

          <button className="btn-gold" onClick={handleAdd} disabled={saving}
            style={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Agregando...' : '+ Agregar imagen'}
          </button>
        </div>
      </div>

      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '16px' }}>
        Imágenes actuales ({gallery.length}/6)
      </h3>

      {loading ? (
        <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
      ) : gallery.length === 0 ? (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>No tienes imágenes en tu galería todavía</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {gallery.map(img => (
            <div key={img.id} style={{ border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                <img src={img.image_url} alt={img.caption || 'Foto'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x400/161616/C9A84C?text=✂' }}
                />
              </div>
              {img.caption && (
                <div style={{ padding: '8px 10px', background: 'var(--black-card)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>{img.caption}</p>
                </div>
              )}
              <button onClick={() => handleDelete(img.id)} style={{
                position: 'absolute', top: '6px', right: '6px',
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#fc8181', width: '26px', height: '26px',
                cursor: 'pointer', fontSize: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
