import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'



// ── Sección Hero ───────────────────────────────────────────────
function Hero() {
  const { user } = useAuth()
  return (
    <section id="inicio" style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '0 5%',
    }}>
      {/* Video de fondo */}
      <video
        src="/barber.mp4"
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Overlay oscuro encima del video */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,0.85) 100%)',
        zIndex: 1,
      }}/>

      {/* Línea decorativa vertical */}
      <div style={{
        position: 'absolute', left: '5%', top: '15%', bottom: '15%',
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
        opacity: 0.4, zIndex: 2,
      }}/>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '80px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '680px' }}>
          <div className="animate-fade-up delay-100">
            
          </div>

          <h1 className="animate-fade-up delay-200" style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: '700', lineHeight: '1.05',
            color: 'var(--white)',
            margin: '24px 0 8px',
          }}>
            El Arte del
            <br/>
            <span className="gold-shimmer">Caballero</span>
            <br/>
            Moderno
          </h1>

          <div className="animate-fade-up delay-300" style={{
            width: '80px', height: '2px', margin: '32px 0',
            background: 'linear-gradient(90deg, var(--gold), transparent)',
          }}/>

          <p className="animate-fade-up delay-400" style={{
            color: 'var(--white-muted)', fontSize: '1.05rem',
            lineHeight: '1.8', maxWidth: '480px', marginBottom: '48px',
          }}>
            Más que un corte de cabello — una experiencia de transformación.
            Maestros del estilo que elevan tu imagen al siguiente nivel.
          </p>

          <div className="animate-fade-up delay-500" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/client') : '/register'}>
              <button className="btn-gold">
                {user ? 'Ir a mi panel' : 'Reservar Cita'}
              </button>
            </Link>
            <a href="#servicios">
              <button className="btn-outline">Ver Servicios</button>
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-500" style={{
            display: 'flex', gap: '48px', marginTop: '64px',
            paddingTop: '40px', borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {[
              { num: '12+',  label: 'Años de experiencia' },
              { num: '8+', label: 'Barberos Profesionales' },
              { num: '6',   label: 'Servicios premium' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '2rem', fontWeight: '700', color: 'var(--gold)',
                }}>{stat.num}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '40px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--white-muted)', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, var(--gold), transparent)',
          animation: 'fadeIn 2s ease infinite alternate',
        }}/>
      </div>
    </section>
  )
}

// ── Sección Servicios ──────────────────────────────────────────
function Services() {
  const services = [
    { icon: '/icons/1.jpg', name: 'Corte Clásico', desc: 'Técnica tradicional perfeccionada a lo largo de décadas.', price: '$25.000', time: '50 min' },
    { icon: '/icons/2.jpg', name: 'Corte + Barba', desc: 'La experiencia completa. Corte impecable y barba definida.', price: '$40.000', time: '50 min' },
    { icon: '/icons/3.jpg', name: 'Degradado Fade', desc: 'Degradados precisos que definen tu estilo único.', price: '$28.000', time: '40 min' },
    { icon: '/icons/4.jpg', name: 'Arreglo de Barba', desc: 'Perfilado profesional con productos de alta gama.', price: '$15.000', time: '25 min' },
    { icon: '/icons/5.jpg', name: 'Afeitado con Navaja', desc: 'Ritual clásico de caballero con vapor y toalla caliente.', price: '$35.000', time: '35 min' },
    { icon: '/icons/6.jpg', name: 'Corte Infantil', desc: 'Ambiente cómodo y amigable para los más pequeños.', price: '$20.000', time: '30 min' },
  ];

  return (
    <section id="servicios" style={{
      padding: '120px 5%',
      background: 'var(--black-soft)',
      position: 'relative',
    }}>
      {/* Línea decorativa top */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        opacity: 0.3,
      }}/>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '72px' }}>
          <span className="section-label">✦ Lo que ofrecemos</span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700', color: 'var(--white)',
            margin: '16px 0 0',
          }}>
            Servicios <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Premium</span>
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {services.map((s, i) => (
            <div key={i} className="card-hover" style={{
              background: 'var(--black-card)',
              border: '1px solid var(--border)',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',      // Flex para dividir en dos columnas
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20px',
            }}>
              
              {/* Imagen ocupa la mitad */}
              <div style={{
                flex: '1',             // Ocupa la mitad del espacio
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img 
                  src={s.icon} 
                  alt={s.name} 
                  style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>

              {/* Texto ocupa la otra mitad */}
              <div style={{ flex: '1' }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.2rem', color: 'var(--white)',
                  marginBottom: '12px',
                }}>{s.name}</h3>

                <p style={{
                  color: 'var(--white-muted)', fontSize: '0.88rem',
                  lineHeight: '1.7', marginBottom: '28px',
                }}>{s.desc}</p>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: '20px', borderTop: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.3rem', color: 'var(--gold)', fontWeight: '600',
                  }}>{s.price}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)', letterSpacing: '0.1em' }}>
                    ⏱ {s.time}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sección Barberos ───────────────────────────────────────────
function Barbers() {
  const [barbers, setBarbers] = useState([])

  useEffect(() => {
  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
  fetch(`${BASE}/api/barbers`)
    .then(r => r.json())
    .then(data => setBarbers(data.data.barbers))
    .catch(err => console.error(err))
}, [])

  return (
    <section id="barberos" style={{ padding: '120px 5%', background: 'var(--black)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '72px' }}>
          <span className="section-label">✦ Nuestro equipo</span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700', color: 'var(--white)',
            margin: '16px 0 0',
          }}>
            Los <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Maestros</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {barbers.map((b, i) => (
            <div key={b.id} className="card-hover" style={{
              background: 'var(--black-card)',
              border: '1px solid var(--border)',
              padding: '48px 40px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Número decorativo */}
              <div style={{
                position: 'absolute', top: '-20px', right: '20px',
                fontFamily: 'Playfair Display, serif',
                fontSize: '8rem', fontWeight: '700',
                color: 'rgba(201,168,76,0.05)',
                lineHeight: 1, userSelect: 'none',
              }}>0{i + 1}</div>

              {/* Avatar */}
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '28px',
                fontFamily: 'Playfair Display, serif',
                fontSize: '2rem', fontWeight: '700',
                color: 'var(--black)',
              }}>{b.name.charAt(0)}</div>

              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.4rem', color: 'var(--white)', marginBottom: '4px',
              }}>{b.name}</h3>

              <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Barbero profesional
                {b.experience_years > 0 && ` · ${b.experience_years} años`}
              </div>

              {b.specialties && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                  {b.specialties.split(',').map(s => (
                    <span key={s} style={{
                      padding: '4px 12px',
                      border: '1px solid var(--border)',
                      fontSize: '0.72rem', color: 'var(--white-muted)',
                      letterSpacing: '0.05em',
                    }}>{s.trim()}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <Link to={`/barber/${b.id}`}>
    <button className="btn-outline" style={{ width: '100%' }}>
      Ver perfil
    </button>
  </Link>
  <Link to="/register" onClick={() => localStorage.setItem('preselected_barber', b.id)}>
  <button className="btn-gold" style={{ width: '100%' }}>
    Reservar con {b.name.split(' ')[0]}
  </button>
</Link>
</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Sección CTA ────────────────────────────────────────────────
function CTA() {
  const [current, setCurrent] = useState(0)

  const slides = [
    {
      url: 'https://i.pinimg.com/1200x/f3/20/d1/f320d183dddef3924c501c1bcf2b2b65.jpg',
      
    },
    {
      url: 'https://i.pinimg.com/736x/58/07/d6/5807d63ae0ff7cb3ea5db7dd3d2be384.jpg',
      
    },
    {
      url: 'https://i.pinimg.com/736x/c5/56/73/c55673de28872db4706b43b6c4b73ef3.jpg',
      
    },
    {
      url: 'https://i.pinimg.com/736x/eb/57/92/eb5792fef5416130aaa4ba97d102de15.jpg',
      
    },
    {
      url: 'https://i.pinimg.com/736x/09/9a/f0/099af0eda6639c5f11f5920a81da0201.jpg',
      
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      height: '85vh',
      minHeight: '560px',
    }}>

      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${slide.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: i === current ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
          zIndex: i === current ? 1 : 0,
        }}/>
      ))}

      {/* Overlay oscuro */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)',
      }}/>

      {/* Línea vertical decorativa */}
      <div style={{
        position: 'absolute', left: '5%', top: '10%', bottom: '10%', zIndex: 3,
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
        opacity: 0.5,
      }}/>

      {/* Contenido */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 5% 64px',
        textAlign: 'center',
      }}>

       

        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2.2rem, 5vw, 4rem)',
          fontWeight: '700',
          color: 'var(--white)',
          margin: '0 0 20px',
          lineHeight: '1.2',
          textShadow: '0 2px 30px rgba(0,0,0,0.5)',
        }}>
          Tu mejor versión
          <br/>
          <span style={{
            background: 'linear-gradient(135deg, var(--gold) 0%, #F3B33D 50%, var(--gold) 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
            display: 'inline-block',
          }}>
            te está esperando
          </span>
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '40px',
          lineHeight: '1.8',
          fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
          maxWidth: '480px',
        }}>
          Reserva tu cita en menos de 2 minutos. Sin filas, sin esperas.
        </p>

        {/* Puntos indicadores */}
        <div style={{
          display: 'flex', gap: '10px', marginTop: '40px',
        }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === current ? '28px' : '8px',
              height: '3px',
              background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.4s ease',
              cursor: 'pointer',
            }} onClick={() => setCurrent(i)}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .btn-gold {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201,168,76,0.4);
        }
        .btn-gold:active { transform: translateY(0); }
      `}</style>
    </section>
  )
}

// ── Sección Contacto ───────────────────────────────────────────
function Contact() {
  return (
    <section id="contacto" style={{ padding: '100px 5%', background: 'var(--black)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px', alignItems: 'start',
        }}>
          {/* Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '36px', height: '36px',
                border: '1px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', color: 'var(--gold)',
              }}>✂</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)' }}>
                BARBERSHOP
              </div>
            </div>
            <p style={{ color: 'var(--white-muted)', lineHeight: '1.8', fontSize: '0.9rem', marginBottom: '32px' }}>
              Donde la maestría en el arte del corte se combina con estilo y modernidad, ofreciendo una experiencia única para cada cliente.
            </p>
           <div style={{ display: 'flex', gap: '12px' }}>
  {[
    { id: 'ig', url: 'https://instagram.com/tuusuario' },
    { id: 'fb', url: 'https://facebook.com/tuusuario' },
    { id: 'wa', url: 'https://wa.me/1234567890' } // WhatsApp con número
  ].map(s => (
    <a
      key={s.id}
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: '36px',
        height: '36px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        color: 'var(--white-muted)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textDecoration: 'none' // elimina subrayado
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.borderColor = 'var(--gold)'; 
        e.currentTarget.style.color = 'var(--gold)'; 
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.borderColor = 'var(--border)'; 
        e.currentTarget.style.color = 'var(--white-muted)'; 
      }}
    >
      {s.id}
    </a>
  ))}
</div>
          </div>

          {/* Datos */}
          {[
            { title: 'Ubicación', items: ['Calle 123 #45-67', 'Bogotá, Colombia'] },
            { title: 'Horario', items: ['Lun–Vie: 9am – 6pm', 'Sábado: 9am – 2pm', 'Domingo: Cerrado'] },
            { title: 'Contacto', items: ['+57 300 123 4567', 'info@barbershop.com'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1rem', color: 'var(--white)',
                marginBottom: '16px',
              }}>{col.title}</h4>
              {col.items.map(item => (
                <p key={item} style={{ color: 'var(--white-muted)', fontSize: '0.88rem', lineHeight: '2' }}>{item}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div style={{
          marginTop: '64px', paddingTop: '32px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{
  display: 'flex',
  justifyContent: 'center',   // centra horizontalmente
  alignItems: 'center',       // centra verticalmente
  height: '60px',             // altura del footer, ajustable
  width: '100%',              // ocupa todo el ancho
  backgroundColor: 'var(--dark-bg)' // opcional, si quieres fondo
}}>
  <span style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>
    © 2026 Barbershop. Todos los derechos reservados.
  </span>
</div>
          
        </div>
      </div>
    </section>
  )
}

// ── Landing page completa ──────────────────────────────────────
export default function Landing() {
  return (
    <div>
      <div className="noise-overlay"/>
      <Hero/>
      <Services/>
      <Barbers/>
      <CTA/>
      <Contact/>
    </div>
  )
}
