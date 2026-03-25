import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout }        = useAuth()
  const navigate                = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardPath = () => {
    if (user?.role === 'admin')  return '/admin'
    if (user?.role === 'barber') return '/barber'
    return '/client'
  }

  const navLinks = [
    { label: 'Inicio',    href: '/#inicio' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Barberos',  href: '/#barberos' },
    { label: 'Contacto',  href: '/#contacto' },
    { label: 'Tienda', href: '/shop' }
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
      padding: '0 5%',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '80px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
          width: '36px',
          height: '36px',
          border: '1px solid var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px'
        }}>
            <img 
              src="/icons/peluqueria.png" 
              alt="logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'invert(1) sepia(1) saturate(5) hue-rotate(10deg)'
              }}
            />
          </div>
          <div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.2rem', fontWeight: '700',
              color: 'var(--white)', letterSpacing: '0.05em',
            }}>BARBERSHOP</div>
            <div style={{
              fontSize: '0.55rem', letterSpacing: '0.3em',
              color: 'var(--gold)', textTransform: 'uppercase',
            }}>Premium Grooming</div>
          </div>
        </Link>

        {/* Links desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}
             className="hidden md:flex">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} style={{
              color: 'var(--white-muted)', textDecoration: 'none',
              fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--gold)'}
            onMouseLeave={e => e.target.style.color = 'var(--white-muted)'}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Botones según estado de sesión — desktop */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
             className="hidden md:flex">
          {user ? (
            // Usuario logueado
            <>
              <Link to={getDashboardPath()}>
                <button className="btn-outline" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem' }}>◈</span>
                  {user.name.split(' ')[0]}
                </button>
              </Link>
              <button className="btn-gold" onClick={handleLogout} style={{ padding: '10px 20px' }}>
                Salir
              </button>
            </>
          ) : (
            // No logueado
            <>
              <Link to="/login">
                <button className="btn-outline" style={{ padding: '10px 20px' }}>Ingresar</button>
              </Link>
              <Link to="/register">
                <button className="btn-gold" style={{ padding: '10px 20px' }}>Reservar</button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          className="md:hidden">
          <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ display: 'block', height: '1px', background: 'var(--gold)', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }}/>
            <span style={{ display: 'block', height: '1px', background: 'var(--gold)', opacity: menuOpen ? 0 : 1 }}/>
            <span style={{ display: 'block', height: '1px', background: 'var(--gold)', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }}/>
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,10,10,0.98)', borderTop: '1px solid var(--border)',
          padding: '24px 5%', display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
               style={{ color: 'var(--white-muted)', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {link.label}
            </a>
          ))}

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            {user ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)}>
                  <button className="btn-outline" style={{ padding: '10px 20px' }}>Mi Panel</button>
                </Link>
                <button className="btn-gold" onClick={() => { handleLogout(); setMenuOpen(false) }} style={{ padding: '10px 20px' }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="btn-outline" style={{ padding: '10px 20px' }}>Ingresar</button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <button className="btn-gold" style={{ padding: '10px 20px' }}>Reservar</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}