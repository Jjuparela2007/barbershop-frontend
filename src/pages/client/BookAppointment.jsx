import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { formatDate } from '../../utils/dateFormat'

export default function BookAppointment() {
  const [step,     setStep]     = useState(1)
  const [barbers,  setBarbers]  = useState([])
  const [services, setServices] = useState([])
  const [slots,    setSlots]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [form,     setForm]     = useState({
    barber_id: '', service_id: '', appointment_date: '', start_time: '', notes: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
  api.get('/barbers').then(r => {
    setBarbers(r.data.data.barbers)

    const preselected = localStorage.getItem('preselected_barber')
    if (preselected) {
      setForm(prev => ({ ...prev, barber_id: preselected }))
      setStep(2) // salta directo al paso de servicio
      localStorage.removeItem('preselected_barber')
    }
  })
  api.get('/services').then(r => setServices(r.data.data.services))
}, [])

  const fetchSlots = async () => {
    if (!form.barber_id || !form.service_id || !form.appointment_date) return
    setLoading(true)
    try {
        console.log('Params:', { barber_id: form.barber_id, service_id: form.service_id, date: form.appointment_date })
      const { data } = await api.get('/appointments/availability', {
        params: { barber_id: form.barber_id, service_id: form.service_id, date: form.appointment_date }
      })
      console.log('Respuesta slots:', data)
      setSlots(data.data.slots)
    } catch { setSlots([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { 
  if (step === 3 && form.appointment_date) fetchSlots() 
}, [step, form.appointment_date])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/appointments', form)
      navigate('/client')
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agendar')
    } finally { setLoading(false) }
  }

  const selectedBarber  = barbers.find(b  => b.id  == form.barber_id)
  const selectedService = services.find(s => s.id  == form.service_id)
  const steps = ['Barbero', 'Servicio', 'Fecha y hora', 'Confirmar']

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--black-card)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--black-soft)', borderBottom: '1px solid var(--border)', padding: '32px 5%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="section-label">✦ Nueva cita</span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', marginTop: '8px' }}>
            Agendar Cita
          </h1>

          {/* Steps indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: i + 1 <= step ? 1 : 0.4 }}>
                  <div style={{
                    width: '28px', height: '28px',
                    border: `1px solid ${i + 1 <= step ? 'var(--gold)' : 'var(--border)'}`,
                    background: i + 1 < step ? 'var(--gold)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', color: i + 1 < step ? 'var(--black)' : 'var(--gold)', fontWeight: '600',
                  }}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)', letterSpacing: '0.08em' }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: 'var(--border)', margin: '0 12px' }}/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 5%' }}>

        {/* Step 1 — Barbero */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginBottom: '24px' }}>
              ¿Con quién quieres tu cita?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2px' }}>
              {barbers.map(b => (
                <div key={b.id} className="card-hover"
                  onClick={() => { setForm({ ...form, barber_id: b.id }); setStep(2) }}
                  style={{
                    background: form.barber_id == b.id ? 'rgba(201,168,76,0.08)' : 'var(--black-card)',
                    border: `1px solid ${form.barber_id == b.id ? 'var(--gold)' : 'var(--border)'}`,
                    padding: '32px', cursor: 'pointer',
                  }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display, serif', fontSize: '1.5rem',
                    color: 'var(--black)', marginBottom: '16px',
                  }}>{b.name.charAt(0)}</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '4px' }}>{b.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    {b.specialties || 'Barbero profesional'}
                  </p>
                  {b.experience_years > 0 && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--white-muted)' }}>{b.experience_years} años de experiencia</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Servicio */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginBottom: '24px' }}>
              ¿Qué servicio deseas?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {services.map(s => (
                <div key={s.id}
                  onClick={() => { setForm({ ...form, service_id: s.id }); setStep(3) }}
                  style={{
                    background: form.service_id == s.id ? 'rgba(201,168,76,0.08)' : 'var(--black-card)',
                    border: `1px solid ${form.service_id == s.id ? 'var(--gold)' : 'var(--border)'}`,
                    padding: '24px 28px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = form.service_id == s.id ? 'var(--gold)' : 'var(--border)'}>
                  <div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '4px' }}>{s.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--white-muted)' }}>⏱ {s.duration_minutes} min</p>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
                    ${Number(s.price).toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline" onClick={() => setStep(1)} style={{ marginTop: '24px' }}>← Atrás</button>
          </div>
        )}

        {/* Step 3 — Fecha y hora */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginBottom: '24px' }}>
              Elige fecha y hora
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                Fecha
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.appointment_date}
                onChange={e => {
  const newDate = e.target.value
  setForm({ ...form, appointment_date: newDate, start_time: '' })
  setSlots([])
}}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
              {form.appointment_date && (
  <button 
    className="btn-outline" 
    onClick={fetchSlots}
    style={{ marginTop: '12px', padding: '10px 24px', fontSize: '0.75rem' }}>
    Buscar horarios disponibles
  </button>
)}
            </div>

            {form.appointment_date && (
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '16px' }}>
                  Horarios disponibles
                </label>
                {loading ? (
                  <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando horarios...</p>
                ) : slots.length === 0 ? (
                  <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--white-muted)', fontSize: '0.88rem' }}>No hay horarios disponibles para esta fecha</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                    {slots.map(slot => (
                      <div key={slot.start_time}
                        onClick={() => setForm({ ...form, start_time: slot.start_time })}
                        style={{
                          padding: '12px', textAlign: 'center', cursor: 'pointer',
                          background: form.start_time === slot.start_time ? 'rgba(201,168,76,0.15)' : 'var(--black-card)',
                          border: `1px solid ${form.start_time === slot.start_time ? 'var(--gold)' : 'var(--border)'}`,
                          color: form.start_time === slot.start_time ? 'var(--gold)' : 'var(--white-muted)',
                          fontSize: '0.85rem', transition: 'all 0.2s',
                        }}>
                        {slot.start_time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                Notas (opcional)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: Quiero el fade bien bajo..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Atrás</button>
              <button className="btn-gold" disabled={!form.start_time} onClick={() => setStep(4)}
                style={{ opacity: form.start_time ? 1 : 0.5 }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmar */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginBottom: '24px' }}>
              Confirma tu cita
            </h2>

            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '40px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Barbero',  value: selectedBarber?.name },
                  { label: 'Servicio', value: selectedService?.name },
                  { label: 'Duración', value: `${selectedService?.duration_minutes} min` },
                  { label: 'Precio',   value: `$${Number(selectedService?.price).toLocaleString('es-CO')}` },
                  { label: 'Fecha', value: `${formatDate(form.appointment_date).day} ${formatDate(form.appointment_date).num} ${formatDate(form.appointment_date).mon}` },
                  { label: 'Hora',  value: `${form.start_time} — ${form.start_time ? (() => { const [h,m] = form.start_time.split(':').map(Number); const end = h*60+m+(services.find(s=>s.id==form.service_id)?.duration_minutes||30); return `${String(Math.floor(end/60)).padStart(2,'0')}:${String(end%60).padStart(2,'0')}` })() : ''}` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--white-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', color: 'var(--white)', fontSize: '0.95rem' }}>{item.value}</span>
                  </div>
                ))}
                {form.notes && (
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--white-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Notas</span>
                    <p style={{ color: 'var(--white)', fontSize: '0.9rem', marginTop: '8px' }}>{form.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline" onClick={() => setStep(3)}>← Atrás</button>
              <button className="btn-gold" onClick={handleSubmit} disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}