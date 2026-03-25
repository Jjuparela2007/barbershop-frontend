import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function BarberProfile() {
  const { id } = useParams()
  const [barber, setBarber] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3001/api/barbers/${id}`).then(r => r.json()),
      fetch('http://localhost:3001/api/services').then(r => r.json()),
    ]).then(([barberData, servicesData]) => {
      setBarber(barberData.data.barber)
      setServices(servicesData.data.services)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [id])

  const DAYS = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.3em' }}>CARGANDO...</div>
    </div>
  )

  if (!barber) return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--white-muted)', marginBottom: '16px' }}>Barbero no encontrado</p>
        <Link to="/"><button className="btn-gold">Volver al inicio</button></Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Hero del barbero */}
      <div style={{
        background: 'var(--black-soft)',
        borderBottom: '1px solid var(--border)',
        padding: '64px 5%',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Número decorativo */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'Playfair Display, serif', fontSize: '14rem', fontWeight: '700',
          color: 'rgba(201,168,76,0.04)', lineHeight: 1, userSelect: 'none',
        }}>✂</div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{
            width: '120px', height: '120px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Playfair Display, serif', fontSize: '3rem',
            fontWeight: '700', color: 'var(--black)',
          }}>
            {barber.name.charAt(0)}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <span className="section-label">✦ Perfil del barbero</span>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'var(--white)', margin: '8px 0 4px',
            }}>{barber.name}</h1>

            <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Barbero profesional {barber.experience_years > 0 && `· ${barber.experience_years} años de experiencia`}
            </div>

            {barber.bio && (
              <p style={{ color: 'var(--white-muted)', fontSize: '0.95rem', lineHeight: '1.8', maxWidth: '560px', marginBottom: '20px' }}>
                {barber.bio}
              </p>
            )}

            {barber.specialties && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                {barber.specialties.split(',').map(s => (
                  <span key={s} style={{
                    padding: '4px 14px', border: '1px solid var(--border)',
                    fontSize: '0.72rem', color: 'var(--white-muted)', letterSpacing: '0.05em',
                  }}>{s.trim()}</span>
                ))}
              </div>
              
            )}

            <Link to={`/register`}>
              <button className="btn-gold">Reservar con {barber.name.split(' ')[0]}</button>
            </Link>
          </div>
        </div>
      </div>
      {barber.gallery && barber.gallery.length > 0 && (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 5% 64px' }}>
    <span className="section-label">✦ Galería</span>
    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)', margin: '12px 0 28px' }}>
      Trabajos recientes
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {barber.gallery.map((img, i) => (
        <div key={img.id} className="card-hover" style={{
          border: '1px solid var(--border)', overflow: 'hidden',
          position: 'relative', aspectRatio: '1',
        }}>
          <img
            src={img.image_url}
            alt={img.caption || `Trabajo ${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = 'https://via.placeholder.com/400x400/161616/C9A84C?text=✂' }}
          />
          {img.caption && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              padding: '24px 16px 12px',
              fontSize: '0.78rem', color: 'var(--white)',
            }}>
              {img.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px' }}>

          {/* Servicios */}
          <div>
            <span className="section-label">✦ Especialidades</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)', margin: '12px 0 28px' }}>
              Servicios disponibles
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {services.map(s => (
                <div key={s.id} className="card-hover" style={{
                  background: 'var(--black-card)', border: '1px solid var(--border)',
                  padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '4px' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>⏱ {s.duration_minutes} min</div>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)' }}>
                    ${Number(s.price).toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div>
            <span className="section-label">✦ Disponibilidad</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--white)', margin: '12px 0 28px' }}>
              Horario semanal
            </h2>

            {barber.schedules && barber.schedules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {barber.schedules.map(s => (
                  <div key={s.day_of_week} style={{
                    background: 'var(--black-card)', border: '1px solid var(--border)',
                    padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--white)', letterSpacing: '0.05em' }}>
                      {DAYS[s.day_of_week]}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>
                        {s.start_time?.slice(0,5)} — {s.end_time?.slice(0,5)}
                      </span>
                      {s.break_start && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)', marginTop: '2px' }}>
                          Descanso: {s.break_start?.slice(0,5)} — {s.break_end?.slice(0,5)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin horario configurado</p>
            )}

            {/* CTA */}
            <div style={{
              marginTop: '32px', padding: '32px',
              background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--white-muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: '1.7' }}>
                ¿Listo para reservar tu cita con {barber.name.split(' ')[0]}?
              </p>
              <Link to="/register">
                <button className="btn-gold" style={{ width: '100%' }}>
                  Reservar Ahora
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Back */}
      <div style={{ textAlign: 'center', paddingBottom: '64px' }}>
        <Link to="/#barberos" style={{ fontSize: '0.75rem', color: 'var(--white-muted)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ← Ver todos los barberos
        </Link>
      </div>
    </div>
  )
}