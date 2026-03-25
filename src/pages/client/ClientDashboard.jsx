import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function ClientDashboard() {
  const { user }                        = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [ratingAppt, setRatingAppt]     = useState(null)

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my')
      setAppointments(data.data.appointments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await api.patch(`/appointments/${id}/status`, {
        status: 'cancelled',
        reason: 'Cancelada por el cliente',
      })
      fetchAppointments()
    } catch {
      alert('No se pudo cancelar la cita')
    }
  }

  const upcoming = appointments.filter(a => ['pending','confirmed'].includes(a.status))
  const past     = appointments.filter(a => ['completed','cancelled','no_show'].includes(a.status))

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
      <span className="section-label">✦ Panel de cliente</span>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', marginTop: '8px' }}>
        Bienvenido, <span style={{ color: 'var(--gold)' }}>{user?.name?.split(' ')[0]}</span>
      </h1>
    </div>
    <div className="panel-header-actions" style={{ display: 'flex', gap: '12px' }}>
      <Link to="/client/profile">
        <button className="btn-outline">Mi Perfil</button>
      </Link>
      
    </div>
  </div>
</div>

      <div className="mobile-padding" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 5%' }}>

        {/* Stats */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2px', marginBottom: '48px',
        }}>
          {[
            { label: 'Total de citas', value: appointments.length },
            { label: 'Próximas citas', value: upcoming.length },
            { label: 'Completadas',    value: appointments.filter(a => a.status === 'completed').length },
            { label: 'Canceladas',     value: appointments.filter(a => a.status === 'cancelled').length },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: '700' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', marginTop: '4px', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Próximas citas */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)' }}>
              Próximas Citas
            </h2>
            <Link to="/client/book">
              <button className="btn-gold" style={{ padding: '10px 20px', fontSize: '0.72rem' }}>+ Agendar</button>
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
          ) : upcoming.length === 0 ? (
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>✂</div>
              <p style={{ color: 'var(--white-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>No tienes citas próximas</p>
              <Link to="/client/book"><button className="btn-gold">Agendar ahora</button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {upcoming.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onCancel={handleCancel} showCancel />
              ))}
            </div>
          )}
        </div>

        {/* Historial */}
        {past.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginBottom: '24px' }}>
              Historial
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {past.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} onRate={setRatingAppt} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de calificación */}
      {ratingAppt && (
        <RatingModal
          appt={ratingAppt}
          onClose={() => setRatingAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
    </div>
  )
}

function AppointmentCard({ appt, onCancel, showCancel, onRate }) {
  const status = STATUS_LABEL[appt.status] || { label: appt.status, color: '#6B7280' }

  return (
    <div className="appt-card" style={{
      background: 'var(--black-card)', border: '1px solid var(--border)',
      padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: '16px', transition: 'border-color 0.3s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Fecha */}
        <div style={{
          background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border)',
          padding: '10px 14px', textAlign: 'center', minWidth: '70px',
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--white-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {formatDate(appt.appointment_date).day}
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--gold)', lineHeight: 1, margin: '2px 0' }}>
            {formatDate(appt.appointment_date).num}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--white-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {formatDate(appt.appointment_date).mon}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '4px' }}>
            {appt.service_name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--white-muted)' }}>
            Con {appt.barber_name} · {appt.start_time?.slice(0,5)} – {appt.end_time?.slice(0,5)}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="appt-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)' }}>
          ${Number(appt.price).toLocaleString('es-CO')}
        </div>
        <div style={{
          padding: '4px 10px',
          border: `1px solid ${status.color}33`,
          background: `${status.color}11`,
          fontSize: '0.68rem', color: status.color,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {status.label}
        </div>
        {showCancel && appt.status === 'pending' && (
          <button onClick={() => onCancel(appt.id)} style={{
            background: 'none', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fc8181', padding: '4px 12px', fontSize: '0.68rem',
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.target.style.background = 'none'}>
            Cancelar
          </button>
        )}
        {onRate && appt.status === 'completed' && (
          <button onClick={() => onRate(appt)} style={{
            background: 'none', border: '1px solid rgba(201,168,76,0.4)',
            color: 'var(--gold)', padding: '4px 12px', fontSize: '0.68rem',
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(201,168,76,0.1)'}
          onMouseLeave={e => e.target.style.background = 'none'}>
            ★ Calificar
          </button>
        )}
      </div>
    </div>
  )
}

function RatingModal({ appt, onClose, onSaved }) {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Selecciona una calificación'); return }
    setLoading(true)
    try {
      await api.post('/ratings', { appointment_id: appt.id, rating, comment })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al calificar')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--black-soft)', border: '1px solid var(--border)',
        width: '100%', maxWidth: '440px', padding: '40px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="section-label">✦ Calificar</span>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)', marginTop: '4px' }}>
              {appt.service_name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--white-muted)', marginTop: '4px' }}>
              Con {appt.barber_name}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '12px' }}>
            Tu calificación
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '2rem', transition: 'transform 0.2s',
                transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                filter: star <= rating ? 'none' : 'grayscale(1) opacity(0.4)',
              }}>★</button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '8px' }}>
            {rating === 1 && 'Muy malo'}
            {rating === 2 && 'Malo'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bueno'}
            {rating === 5 && 'Excelente'}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
            Comentario (opcional)
          </label>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="¿Cómo fue tu experiencia?" rows={3}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--black-card)', border: '1px solid var(--border)',
              color: 'var(--white)', fontSize: '0.88rem', outline: 'none',
              fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#fc8181' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
          <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </div>
  )
}
