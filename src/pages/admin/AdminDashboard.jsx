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

export default function AdminDashboard() {
  const { user, logout }      = useAuth()
  const [stats, setStats]     = useState(null)
  const [section, setSection] = useState('dashboard')
  const navigate              = useNavigate()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data.data.stats)
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const menuItems = [
    { key: 'dashboard',    label: 'Dashboard',     icon:  '' },
    { key: 'appointments', label: 'Citas',          icon: '' },
    { key: 'users',        label: 'Usuarios',       icon: '' },
    { key: 'barbers',      label: 'Barberos',       icon: '' },
    { key: 'horarios',     label: 'Horarios',       icon: '' },
    { key: 'ratings',      label: 'Calificaciones', icon: '' },
    { key: 'shop',         label: 'Tienda',         icon: '' },
    { key: 'services',     label: 'Servicios',      icon: '' },
  ]

  return (
    <div className="admin-layout" style={{
      minHeight: '100vh', background: 'var(--black)',
      paddingTop: '80px', display: 'flex',
    }}>
      <div className="admin-sidebar" style={{
        width: '240px', minHeight: 'calc(100vh - 80px)',
        background: 'var(--black-soft)', borderRight: '1px solid var(--border)',
        padding: '32px 0', flexShrink: 0, display: 'flex', flexDirection: 'column',
      }}>
        <div className="sidebar-header" style={{ padding: '0 24px', marginBottom: '32px' }}>
          <span className="section-label">✦ Administración</span>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginTop: '8px' }}>
            {user?.name?.split(' ')[0]}
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <button key={item.key} onClick={() => setSection(item.key)} style={{
              width: '100%', padding: '14px 24px',
              background: section === item.key ? 'rgba(201,168,76,0.1)' : 'none',
              border: 'none',
              borderLeft: `2px solid ${section === item.key ? 'var(--gold)' : 'transparent'}`,
              color: section === item.key ? 'var(--gold)' : 'var(--white-muted)',
              fontSize: '0.82rem', letterSpacing: '0.08em',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
            }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-logout" style={{ padding: '24px' }}>
          <button className="btn-outline" onClick={handleLogout} style={{ width: '100%', padding: '10px' }}>Salir</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 5%', overflowY: 'auto' }}>
        {section === 'dashboard'    && <SectionDashboard stats={stats} />}
        {section === 'appointments' && <SectionAppointments />}
        {section === 'users'        && <SectionUsers />}
        {section === 'barbers'      && <SectionBarbers />}
        {section === 'horarios'     && <SectionHorarios />}
        {section === 'ratings'      && <SectionRatings />}
        {section === 'shop'         && <SectionShop />}
        {section === 'services'     && <SectionServices />}
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────
function SectionDashboard({ stats }) {
  const [revenue,     setRevenue]     = useState(null)
  const [netRevenue,  setNetRevenue]  = useState(null)
  const [barberStats, setBarberStats] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [period,      setPeriod]      = useState('monthly')

  useEffect(() => {
    Promise.all([
      api.get('/admin/revenue-stats'),
      api.get('/admin/net-revenue'),
      api.get('/admin/barber-stats'),
    ]).then(([r1, r2, r3]) => {
      setRevenue(r1.data.data.stats)
      setNetRevenue(r2.data.data.data)
      setBarberStats(r3.data.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (!stats || loading) return <p style={{ color: 'var(--white-muted)' }}>Cargando...</p>

  const DAYS_ES = {
    'Monday': 'Lun', 'Tuesday': 'Mar', 'Wednesday': 'Mié',
    'Thursday': 'Jue', 'Friday': 'Vie', 'Saturday': 'Sáb', 'Sunday': 'Dom'
  }

  const periodData = {
    daily:   { label: 'Hoy',         data: revenue?.daily   },
    weekly:  { label: 'Esta semana', data: revenue?.weekly  },
    monthly: { label: 'Este mes',    data: revenue?.monthly },
  }

  const current  = periodData[period]
  const maxDay   = revenue?.byDay?.length > 0 ? Math.max(...revenue.byDay.map(d => Number(d.total))) : 0
  const hasPending = stats.pending_appointments > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      <div>
        <span className="section-label">✦ Resumen general</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 0' }}>Dashboard</h2>
      </div>

      {hasPending && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.35)',
          borderLeft: '4px solid #F59E0B',
          padding: '20px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}></span>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#F59E0B' }}>
                {stats.pending_appointments} cita{stats.pending_appointments > 1 ? 's' : ''} pendiente{stats.pending_appointments > 1 ? 's' : ''} de confirmar
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', marginTop: '3px' }}>
                Ve a la sección Citas para confirmar o cancelar
              </div>
            </div>
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', color: 'rgba(245,158,11,0.25)', fontWeight: '700', lineHeight: 1 }}>
            {stats.pending_appointments}
          </div>
        </div>
      )}

      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--white-muted)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 14px' }}>Hoy</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
            border: '1px solid rgba(201,168,76,0.3)', padding: '28px 24px',
          }}>
            <div style={{ fontSize: '0.63rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>Ingresos del día</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: '700', lineHeight: 1 }}>
              ${Number(revenue?.daily?.total || 0).toLocaleString('es-CO')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginTop: '8px' }}>
              {revenue?.daily?.count || 0} citas completadas
            </div>
          </div>
          {[
            { label: 'Clientes activos', value: stats.total_clients,      sub: 'registrados'  },
            { label: 'Barberos',         value: stats.total_barbers,      sub: 'en el equipo' },
            { label: 'Total citas',      value: stats.total_appointments, sub: 'históricas'   },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px 24px' }}>
              <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>{kpi.label}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--white)', fontWeight: '700', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginTop: '8px', opacity: 0.6 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--white-muted)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: 0 }}>Ingresos</p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(periodData).map(([key]) => (
              <button key={key} onClick={() => setPeriod(key)} style={{
                padding: '6px 12px', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                background: period === key ? 'var(--gold)' : 'none',
                border: `1px solid ${period === key ? 'var(--gold)' : 'var(--border)'}`,
                color: period === key ? 'var(--black)' : 'var(--white-muted)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {key === 'daily' ? 'Hoy' : key === 'weekly' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '36px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)', marginBottom: '10px' }}>{current.label} · total combinado</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', color: 'var(--gold)', fontWeight: '700', lineHeight: 1 }}>
                ${Number(current.data?.total || 0).toLocaleString('es-CO')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { label: 'Servicios', val: current.data?.services },
                { label: ' Tienda',   val: current.data?.shop     },
                { label: 'Citas',     val: current.data?.count    },
              ].map((item, i) => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--white)' }}>
                    {i < 2 ? `$${Number(item.val || 0).toLocaleString('es-CO')}` : (item.val || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: 'Hoy',         val: revenue?.daily?.total,   cnt: revenue?.daily?.count,   key: 'daily'   },
              { label: 'Esta semana', val: revenue?.weekly?.total,  cnt: revenue?.weekly?.count,  key: 'weekly'  },
              { label: 'Este mes',    val: revenue?.monthly?.total, cnt: revenue?.monthly?.count, key: 'monthly' },
            ].map((item, i) => (
              <div key={item.label} style={{
                padding: '18px 24px',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                borderTop: '1px solid var(--border)',
                background: period === item.key ? 'rgba(201,168,76,0.04)' : 'none',
              }}>
                <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--gold)' }}>
                  ${Number(item.val || 0).toLocaleString('es-CO')}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--white-muted)', marginTop: '2px' }}>{item.cnt || 0} citas</div>
              </div>
            ))}
          </div>

          {netRevenue && (
            <div style={{ padding: '28px 32px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>
                Distribución — comisión barberos {netRevenue.commission_rate}%
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginBottom: '18px' }}>
                {[
                  { label: 'Ingresos brutos',   value: `$${Number(netRevenue.gross_revenue).toLocaleString('es-CO')}`,     color: 'var(--white)' },
                  { label: 'Comisión barberos', value: `$${Number(netRevenue.barber_commission).toLocaleString('es-CO')}`, color: '#fc8181'      },
                  { label: 'Ingresos netos',    value: `$${Number(netRevenue.net_revenue).toLocaleString('es-CO')}`,       color: '#6ee7b7'      },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', padding: '16px 20px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: item.color, fontWeight: '700' }}>{item.value}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--white-muted)', marginTop: '4px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', display: 'flex', marginBottom: '8px' }}>
                <div style={{ width: `${100 - netRevenue.commission_rate}%`, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', transition: 'width 0.8s ease' }}/>
                <div style={{ width: `${netRevenue.commission_rate}%`, background: 'rgba(252,129,129,0.6)', transition: 'width 0.8s ease' }}/>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: netRevenue.by_barber?.length > 0 ? '24px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '2px' }}/>
                  <span style={{ fontSize: '0.63rem', color: 'var(--white-muted)' }}>Negocio ({100 - netRevenue.commission_rate}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'rgba(252,129,129,0.6)', borderRadius: '2px' }}/>
                  <span style={{ fontSize: '0.63rem', color: 'var(--white-muted)' }}>Barberos ({netRevenue.commission_rate}%)</span>
                </div>
              </div>

              {netRevenue.by_barber?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Por barbero</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {netRevenue.by_barber.map(b => (
                      <div key={b.barber_name} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--black-soft)', border: '1px solid var(--border)',
                        padding: '14px 20px', flexWrap: 'wrap', gap: '12px',
                      }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Playfair Display, serif', fontSize: '0.85rem', color: 'var(--black)',
                          }}>{b.barber_name.charAt(0)}</div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{b.barber_name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)' }}>{b.total_cuts} cortes</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Generó</div>
                            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.9rem', color: 'var(--white)' }}>${Number(b.gross).toLocaleString('es-CO')}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Su comisión</div>
                            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.9rem', color: '#fc8181' }}>${Number(b.commission).toLocaleString('es-CO')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {barberStats && (
        <div>
          <p style={{ fontSize: '0.65rem', color: 'var(--white-muted)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 14px' }}>Rendimiento de barberos</p>
          <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px' }}>
            <BarberStatsTable barbers={barberStats.barbers} />
          </div>
        </div>
      )}

      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--white-muted)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 14px' }}>Detalle este mes</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '2px' }}>
          <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px' }}>
            <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>✂ Servicios más vendidos</div>
            {!revenue?.topServices?.length ? (
              <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin datos este mes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {revenue.topServices.map((s, i) => (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: i === 0 ? 'var(--gold)' : 'var(--white-muted)' }}>0{i + 1}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{s.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>${Number(s.total).toLocaleString('es-CO')}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--white-muted)' }}>{s.count} veces</div>
                      </div>
                    </div>
                    <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--gold-dark)' : 'rgba(201,168,76,0.4)',
                        width: `${(s.count / (revenue.topServices[0]?.count || 1)) * 100}%`,
                        transition: 'width 0.6s ease',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px' }}>
            <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>🛍 Productos más vendidos</div>
            {!revenue?.topProducts?.length ? (
              <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin ventas en tienda este mes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {revenue.topProducts.map((p, i) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: i === 0 ? 'var(--gold)' : 'var(--white-muted)' }}>0{i + 1}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{p.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>${Number(p.total).toLocaleString('es-CO')}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--white-muted)' }}>{p.count} unidades</div>
                      </div>
                    </div>
                    <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--gold-dark)' : 'rgba(201,168,76,0.4)',
                        width: `${(p.count / (revenue.topProducts[0]?.count || 1)) * 100}%`,
                        transition: 'width 0.6s ease',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '32px' }}>
          <div style={{ fontSize: '0.63rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '28px' }}>Ventas por día · esta semana</div>
          {!revenue?.byDay?.length ? (
            <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin ventas esta semana</p>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '180px' }}>
              {revenue.byDay.map(d => (
                <div key={d.day_name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                    ${Number(d.total).toLocaleString('es-CO')}
                  </div>
                  <div style={{
                    width: '100%', background: 'linear-gradient(to top, var(--gold), var(--gold-light))',
                    borderRadius: '2px 2px 0 0',
                    height: maxDay > 0 ? `${(Number(d.total) / maxDay) * 120}px` : '4px',
                    minHeight: '4px', transition: 'height 0.5s ease',
                  }}/>
                  <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {DAYS_ES[d.day_name] || d.day_name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--white-muted)', opacity: 0.6 }}>{d.count} citas</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}


// ── Citas ──────────────────────────────────────────────────────
function SectionAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('')

  useEffect(() => { fetchAppointments() }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const { data } = await api.get('/admin/appointments', { params })
      setAppointments(data.data.appointments)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      fetchAppointments()
    } catch { alert('No se pudo actualizar') }
  }

  return (
    <div>
      <span className="section-label">✦ Gestión</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 24px' }}>Todas las Citas</h2>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { key: '',          label: 'Todas'       },
          { key: 'pending',   label: 'Pendientes'  },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'completed', label: 'Completadas' },
          { key: 'cancelled', label: 'Canceladas'  },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'btn-gold' : 'btn-outline'}
            style={{ padding: '8px 18px', fontSize: '0.72rem' }}>
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
      ) : appointments.length === 0 ? (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--white-muted)' }}>No hay citas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {appointments.map(appt => {
            const status = STATUS_LABEL[appt.status] || { label: appt.status, color: '#6B7280' }
            return (
              <div key={appt.id} style={{
                background: 'var(--black-card)', border: '1px solid var(--border)',
                padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '12px', transition: 'border-color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border)', padding: '8px 12px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--white-muted)', textTransform: 'uppercase' }}>{formatDate(appt.appointment_date).day}</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--gold)' }}>{formatDate(appt.appointment_date).num}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--white-muted)', textTransform: 'uppercase' }}>{formatDate(appt.appointment_date).mon}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '2px' }}>
                      {appt.client_name} → {appt.barber_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>
                      {appt.service_name} · {appt.start_time?.slice(0,5)} · ${Number(appt.price).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ padding: '4px 10px', border: `1px solid ${status.color}33`, background: `${status.color}11`, fontSize: '0.68rem', color: status.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {status.label}
                  </div>
                  {appt.status === 'pending' && (
                    <button className="btn-gold" onClick={() => handleStatus(appt.id, 'confirmed')} style={{ padding: '6px 12px', fontSize: '0.68rem' }}>Confirmar</button>
                  )}
                  {['pending','confirmed'].includes(appt.status) && (
                    <button onClick={() => handleStatus(appt.id, 'cancelled')}
                      style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', padding: '6px 12px', fontSize: '0.68rem', cursor: 'pointer', transition: 'all 0.3s' }}
                      onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.target.style.background = 'none'}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SectionUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('client')
  const [search, setSearch]     = useState('')
  const [editing, setEditing]   = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.data.users)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleStatus = async (id, is_active, action) => {
    let confirmMessage = ''
    let actionMessage = ''
    let newStatus

    if (action === 'deactivate') {
      confirmMessage = '¿Desactivar este usuario? Podrá reactivarse más tarde y sus citas históricas se mantendrán.'
      actionMessage = 'desactivar'
      newStatus = false
    } else if (action === 'reactivate') {
      confirmMessage = '¿Reactivar este usuario? Volverá a tener acceso al sistema.'
      actionMessage = 'reactivar'
      newStatus = true
    } else return

    if (!confirm(confirmMessage)) return

    try {
      setActionLoading(true)
      await api.patch(`/admin/users/${id}`, { is_active: newStatus })
      setMsg(`✓ Usuario ${actionMessage}do correctamente`)
      setTimeout(() => setMsg(''), 3000)
      fetchUsers()
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || `No se pudo ${actionMessage} el usuario`
      alert(msg)
      setMsg(`✗ ${msg}`)
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setActionLoading(false)
    }
  }

  const openEdit = (user) => {
    setEditing(user)
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '', new_password: '', specialties: '', experience_years: 0, bio: '' })
    setShowNewPassword(false)
    setImageFile(null)
    setImagePreview(user.avatar_url ? `${BASE}${user.avatar_url}` : null)
    setMsg('')
    if (user.role === 'barber') {
      api.get(`/barbers/${user.id}`).then(r => {
        const bp = r.data.data.barber
        setEditForm(prev => ({ ...prev, specialties: bp.specialties || '', experience_years: bp.experience_years || 0, bio: bp.bio || '' }))
      }).catch(err => console.error('Error fetching barber details:', err))
    }
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await api.put(`/users/${editing.id}`, { name: editForm.name, email: editForm.email, phone: editForm.phone })
      if (editForm.new_password) await api.put(`/users/${editing.id}/password`, { new_password: editForm.new_password })
      if (editing.role === 'barber') {
        await api.put(`/users/${editing.id}/barber-profile`, { specialties: editForm.specialties, experience_years: Number(editForm.experience_years), bio: editForm.bio })
        // Subir avatar si se seleccionó uno
        if (imageFile) {
          const formData = new FormData()
          formData.append('image', imageFile)
          await api.post(`/barbers/${editing.id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      }
      setMsg('✓ Guardado correctamente')
      setTimeout(() => setMsg(''), 3000)
      fetchUsers()
      setEditing(null)
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.error || 'Error al guardar'))
    } finally { setSaving(false) }
  }

  const ROLE_COLOR = { admin: '#8B5CF6', barber: '#C9A84C', client: '#10B981' }
  const clients = users.filter(u => u.role === 'client')
  const barbers = users.filter(u => u.role === 'barber')
  const filtered = (tab === 'client' ? clients : barbers)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
    )
    .sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--black)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.85rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  return (
    <div>
      <span className="section-label">✦ Gestión</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 24px' }}>Usuarios</h2>

      {msg && (
        <div style={{
          marginBottom: '20px', padding: '12px 16px', fontSize: '0.85rem',
          background: msg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
          color: msg.startsWith('✓') ? '#6ee7b7' : '#fc8181',
        }}>{msg}</div>
      )}

      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'client', label: `Clientes (${clients.length})` },
          { key: 'barber', label: `Barberos (${barbers.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch('') }} style={{
            padding: '12px 28px', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.key ? 'var(--gold)' : 'transparent'}`,
            color: tab === t.key ? 'var(--gold)' : 'var(--white-muted)',
            fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.3s', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          placeholder={`🔍 Buscar ${tab === 'client' ? 'cliente' : 'barbero'} por nombre, correo o teléfono...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', boxSizing: 'border-box',
            background: 'var(--black-card)', border: '1px solid var(--border)',
            color: 'var(--white)', fontSize: '0.85rem', outline: 'none',
            fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.3s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--white-muted)' }}>
            {search ? `Sin resultados para "${search}"` : `No hay ${tab === 'client' ? 'clientes' : 'barberos'} registrados`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filtered.map(u => (
            <div key={u.id} style={{
              background: 'var(--black-card)', border: '1px solid var(--border)',
              padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px',
              opacity: u.is_active ? 1 : 0.5, transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                {/* Avatar o inicial */}
                {u.avatar_url ? (
                  <img src={u.avatar_url} style={{
                    width: '40px', height: '40px', objectFit: 'cover',
                    border: `1px solid ${ROLE_COLOR[u.role]}`,
                  }} />
                ) : (
                  <div style={{
                    width: '40px', height: '40px',
                    background: `linear-gradient(135deg, ${ROLE_COLOR[u.role]}88, ${ROLE_COLOR[u.role]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--black)',
                  }}>{u.name.charAt(0)}</div>
                )}

                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '2px' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)' }}>{u.email} {u.phone && `· ${u.phone}`}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  padding: '3px 10px',
                  background: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${u.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  fontSize: '0.65rem', color: u.is_active ? '#6ee7b7' : '#fc8181',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>{u.is_active ? 'Activo' : 'Inactivo'}</div>
                <button onClick={() => openEdit(u)} className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.7rem' }} disabled={actionLoading}>Editar</button>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => toggleStatus(u.id, u.is_active, u.is_active ? 'deactivate' : 'reactivate')}
                    disabled={actionLoading}
                    style={{
                      background: 'none',
                      border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      color: u.is_active ? '#fc8181' : '#6ee7b7',
                      padding: '6px 12px', fontSize: '0.68rem', cursor: actionLoading ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s',
                      opacity: actionLoading ? 0.5 : 1,
                    }}
                  >
                    {actionLoading ? 'Procesando...' : (u.is_active ? 'Desactivar' : 'Reactivar')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{
            background: 'var(--black-soft)', border: '1px solid var(--border)',
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <span className="section-label">✦ Editando</span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)', marginTop: '4px' }}>{editing.name}</h3>
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name',  label: 'Nombre',   type: 'text'  },
                { key: 'email', label: 'Correo',   type: 'email' },
                { key: 'phone', label: 'Teléfono', type: 'tel'   },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}

              {editing.role === 'barber' && (
                <>
                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}/>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Perfil de barbero</p>
                  {[
                    { key: 'specialties',      label: 'Especialidades',   type: 'text'   },
                    { key: 'experience_years', label: 'Años experiencia', type: 'number' },
                    { key: 'bio',              label: 'Biografía',        type: 'text'   },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>{f.label}</label>
                      <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}

                  {/* Avatar del barbero */}
                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}/>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Foto de perfil</p>
                  <div>
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" style={{
                        width: '80px', height: '80px', objectFit: 'cover',
                        marginBottom: '10px', border: '2px solid var(--gold)',
                      }} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                          setImageFile(file)
                          setImagePreview(URL.createObjectURL(file))
                        }
                      }}
                      style={{ ...inputStyle, padding: '8px', cursor: 'pointer' }}
                    />
                  </div>
                </>
              )}

              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}/>
              <p style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Nueva contraseña (opcional)</p>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
                  Dejar vacío para no cambiar
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={editForm.new_password || ''}
                    onChange={e => setEditForm({ ...editForm, new_password: e.target.value })}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="button" onClick={() => setShowNewPassword(prev => !prev)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: 'var(--white-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--white-muted)'}
                  >
                    {showNewPassword ? (
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

              {msg && (
                <div style={{
                  padding: '10px 14px', fontSize: '0.82rem',
                  background: msg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                  border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
                  color: msg.startsWith('✓') ? '#6ee7b7' : '#fc8181',
                }}>{msg}</div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-outline" onClick={() => setEditing(null)} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Barberos ───────────────────────────────────────────────────
function SectionBarbers() {
  const [form, setForm]           = useState({ name: '', email: '', password: '', phone: '', specialties: '', experience_years: 0 })
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    try {
      await api.post('/admin/barbers', form)
      setSuccess('Barbero creado correctamente')
      setForm({ name: '', email: '', password: '', phone: '', specialties: '', experience_years: 0 })
      setShowPassword(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear barbero')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'var(--black-card)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.88rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  return (
    <div>
      <span className="section-label">✦ Gestión</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 32px' }}>Agregar Barbero</h2>
      <div style={{ maxWidth: '520px' }}>
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', marginBottom: '24px', fontSize: '0.85rem', color: '#6ee7b7' }}>{success}</div>}
        {error   && <div style={{ background: 'rgba(220,38,38,0.1)',  border: '1px solid rgba(220,38,38,0.3)',  padding: '12px 16px', marginBottom: '24px', fontSize: '0.85rem', color: '#fc8181' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { name: 'name',             label: 'Nombre completo',  type: 'text',   required: true  },
            { name: 'email',            label: 'Correo',           type: 'email',  required: true  },
            { name: 'phone',            label: 'Teléfono',         type: 'tel',    required: false },
            { name: 'specialties',      label: 'Especialidades',   type: 'text',   required: false },
            { name: 'experience_years', label: 'Años experiencia', type: 'number', required: false },
          ].map(field => (
            <div key={field.name}>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>{field.label}</label>
              <input type={field.type} value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                required={field.required} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', color: 'var(--white-muted)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--white-muted)'}
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

          <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creando...' : 'Crear Barbero'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Horarios ───────────────────────────────────────────────────
function SectionHorarios() {
  const [barbers,  setBarbers]  = useState([])
  const [selected, setSelected] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  const DAYS = [
    { num: 1, label: 'Lunes' }, { num: 2, label: 'Martes' }, { num: 3, label: 'Miércoles' },
    { num: 4, label: 'Jueves' }, { num: 5, label: 'Viernes' }, { num: 6, label: 'Sábado' }, { num: 7, label: 'Domingo' },
  ]

  useEffect(() => { api.get('/barbers').then(r => setBarbers(r.data.data.barbers)) }, [])

  const loadSchedule = async (barber) => {
    setSelected(barber); setMsg('')
    const { data } = await api.get(`/barbers/${barber.id}/schedule`)
    const existing = data.data.schedule
    setSchedule(DAYS.map(day => {
      const found = existing.find(s => s.day_of_week === day.num)
      return {
        day_of_week: day.num, label: day.label, active: !!found,
        start_time:  found?.start_time?.slice(0,5)  || '09:00',
        end_time:    found?.end_time?.slice(0,5)    || '18:00',
        break_start: found?.break_start?.slice(0,5) || '',
        break_end:   found?.break_end?.slice(0,5)   || '',
      }
    }))
  }

  const toggleDay   = (i) => { const u = [...schedule]; u[i].active = !u[i].active; setSchedule(u) }
  const updateField = (i, f, v) => { const u = [...schedule]; u[i][f] = v; setSchedule(u) }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const activeDays = schedule.filter(s => s.active).map(s => ({
        day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time,
        break_start: s.break_start || null, break_end: s.break_end || null,
      }))
      await api.put(`/barbers/${selected.id}/schedule`, { schedules: activeDays })
      setMsg('✓ Horario guardado correctamente')
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.error || 'Error al guardar'))
    } finally { setSaving(false) }
  }

  const inputStyle = {
    padding: '6px 10px', background: 'var(--black)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.82rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.3s',
  }

  return (
    <div>
      <span className="section-label">✦ Gestión</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 32px' }}>Horarios de Barberos</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {barbers.map(b => (
          <button key={b.id} onClick={() => loadSchedule(b)}
            className={selected?.id === b.id ? 'btn-gold' : 'btn-outline'}
            style={{ padding: '12px 24px', fontSize: '0.8rem' }}>
            {b.name.split(' ')[0]}
          </button>
        ))}
      </div>
      {!selected ? (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--white-muted)' }}>Selecciona un barbero para editar su horario</p>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Activa o desactiva los días. Los días desactivados aparecerán como <span style={{ color: 'var(--gold)' }}>no disponibles</span> al agendar.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '28px' }}>
            {schedule.map((day, i) => (
              <div key={day.day_of_week} style={{
                background: 'var(--black-card)',
                border: `1px solid ${day.active ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`,
                padding: '20px 24px', display: 'flex', alignItems: 'center',
                gap: '24px', flexWrap: 'wrap', opacity: day.active ? 1 : 0.6, transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '130px' }}>
                  <div onClick={() => toggleDay(i)} style={{
                    width: '40px', height: '22px',
                    background: day.active ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '11px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                  }}>
                    <div style={{ position: 'absolute', top: '3px', left: day.active ? '21px' : '3px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: 'left 0.3s' }}/>
                  </div>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: day.active ? 'var(--white)' : 'var(--white-muted)' }}>{day.label}</span>
                </div>
                {day.active ? (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[{ key: 'start_time', label: 'ENTRADA' }, { key: 'end_time', label: 'SALIDA' }].map(f => (
                      <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--white-muted)', letterSpacing: '0.1em' }}>{f.label}</span>
                        <input type="time" value={day[f.key]} onChange={e => updateField(i, f.key, e.target.value)}
                          style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--white-muted)', letterSpacing: '0.1em' }}>DESCANSO</span>
                      <input type="time" value={day.break_start} onChange={e => updateField(i, 'break_start', e.target.value)}
                        style={{ ...inputStyle, width: '110px' }} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      <span style={{ color: 'var(--white-muted)', fontSize: '0.8rem' }}>–</span>
                      <input type="time" value={day.break_end} onChange={e => updateField(i, 'break_end', e.target.value)}
                        style={{ ...inputStyle, width: '110px' }} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#fc8181' }}>✕ Día de descanso — no disponible para citas</span>
                )}
              </div>
            ))}
          </div>
          {msg && (
            <div style={{
              padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem',
              background: msg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
              border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
              color: msg.startsWith('✓') ? '#6ee7b7' : '#fc8181',
            }}>{msg}</div>
          )}
          <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar Horario'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Calificaciones ─────────────────────────────────────────────
function SectionRatings() {
  const [barbers,  setBarbers]  = useState([])
  const [selected, setSelected] = useState(null)
  const [details,  setDetails]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/ratings/summary').then(r => setBarbers(r.data.data.barbers)).finally(() => setLoading(false))
  }, [])

  const loadDetails = async (barber) => {
    setSelected(barber)
    const { data } = await api.get(`/ratings/barber/${barber.id}`)
    setDetails(data.data)
  }

  const Stars = ({ value }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: '0.9rem', color: s <= Math.round(value) ? '#C9A84C' : 'rgba(201,168,76,0.2)' }}>★</span>
      ))}
    </div>
  )

  return (
    <div>
      <span className="section-label">✦ Reputación</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 32px' }}>
        Calificaciones de mis Barberos
      </h2>
      {loading ? (
        <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {barbers.map(b => (
              <div key={b.id} onClick={() => loadDetails(b)}
                style={{
                  background: selected?.id === b.id ? 'rgba(201,168,76,0.08)' : 'var(--black-card)',
                  border: `1px solid ${selected?.id === b.id ? 'var(--gold)' : 'var(--border)'}`,
                  padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
                onMouseEnter={e => { if (selected?.id !== b.id) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
                onMouseLeave={e => { if (selected?.id !== b.id) e.currentTarget.style.borderColor = 'var(--border)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--black)',
                  }}>{b.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '4px' }}>{b.name}</div>
                    {b.average ? <Stars value={b.average} /> : <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>Sin calificaciones</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {b.average ? (
                    <>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>{b.average}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)', marginTop: '2px' }}>{b.total_ratings} reseñas</div>
                    </>
                  ) : <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>—</span>}
                </div>
              </div>
            ))}
          </div>
          {selected && details && (
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)' }}>
                  Reseñas de {selected.name.split(' ')[0]}
                </h3>
                <button onClick={() => { setSelected(null); setDetails(null) }}
                  style={{ background: 'none', border: 'none', color: 'var(--white-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
              {details.ratings.length === 0 ? (
                <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Sin reseñas todavía</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {details.ratings.map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--white)' }}>{r.client_name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: '0.8rem', color: s <= r.rating ? '#C9A84C' : 'rgba(201,168,76,0.2)' }}>★</span>
                          ))}
                        </div>
                      </div>
                      {r.comment && <p style={{ fontSize: '0.78rem', color: 'var(--white-muted)', lineHeight: '1.6' }}>{r.comment}</p>}
                      <span style={{ fontSize: '0.68rem', color: 'var(--white-muted)', opacity: 0.6 }}>
                        {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Estadísticas de barberos ───────────────────────────────────
function BarberStatsTable({ barbers }) {
  const [period, setPeriod] = useState('today')

  const periods = [
    { key: 'today', label: 'Hoy',         cutsKey: 'cuts_today',  revKey: 'revenue_today'  },
    { key: 'week',  label: 'Esta semana', cutsKey: 'cuts_week',   revKey: 'revenue_week'   },
    { key: 'month', label: 'Este mes',    cutsKey: 'cuts_month',  revKey: 'revenue_month'  },
  ]

  const current = periods.find(p => p.key === period)
  const sorted  = [...barbers].sort((a, b) => b[current.cutsKey] - a[current.cutsKey])
  const maxCuts = Math.max(...sorted.map(b => b[current.cutsKey]), 1)

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {periods.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{
            padding: '8px 18px', fontSize: '0.72rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: period === p.key ? 'var(--gold)' : 'none',
            border: `1px solid ${period === p.key ? 'var(--gold)' : 'var(--border)'}`,
            color: period === p.key ? 'var(--black)' : 'var(--white-muted)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{p.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sorted.map((b, i) => (
          <div key={b.barber_name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '28px', height: '28px',
                  background: i === 0 ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'var(--black-soft)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, serif', fontSize: '0.8rem',
                  color: i === 0 ? 'var(--black)' : 'var(--white-muted)',
                }}>#{i + 1}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--white)' }}>{b.barber_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--white-muted)' }}>
                    ${Number(b[current.revKey]).toLocaleString('es-CO')} generados
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: i === 0 ? 'var(--gold)' : 'var(--white)', lineHeight: 1 }}>
                  {b[current.cutsKey]}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--white-muted)' }}>cortes</div>
              </div>
            </div>
            <div style={{ height: '4px', background: 'var(--black-soft)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(b[current.cutsKey] / maxCuts) * 100}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, var(--gold-dark), var(--gold))'
                  : i === 1 ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.25)',
                borderRadius: '2px', transition: 'width 0.6s ease',
              }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tienda ─────────────────────────────────────────────────────
function SectionShop() {
  const [products, setProducts] = useState([])
  const [orders,   setOrders]   = useState([])
  const [tab, setTab]           = useState('products')
  const [form, setForm]         = useState({ name: '', description: '', category: 'barberia', price: '', stock: '', image_url: '' })
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

  const [editing,     setEditing]     = useState(null)
  const [editForm,    setEditForm]    = useState({})
  const [editSaving,  setEditSaving]  = useState(false)
  const [editMsg,     setEditMsg]     = useState('')
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState('')

  const [orderDetail,        setOrderDetail]        = useState(null)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)

  useEffect(() => {
    api.get('/shop/products').then(r => setProducts(r.data.data.products))
    api.get('/shop/orders').then(r => setOrders(r.data.data.orders))
  }, [])

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const { data } = await api.post('/shop/products', {
        ...form, price: Number(form.price), stock: Number(form.stock),
      })
      setProducts(prev => [...prev, data.data.product])
      setForm({ name: '', description: '', category: 'barberia', price: '', stock: '', image_url: '' })
      setMsg('✓ Producto creado correctamente')
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.error || 'Error'))
    } finally { setSaving(false) }
  }

  const openEdit = (p) => {
    setEditing(p)
    setEditForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, stock: p.stock, image_url: p.image_url || '' })
    setEditMsg('')
  }

  const handleUpdate = async e => {
    e.preventDefault(); setEditSaving(true); setEditMsg('')
    try {
      await api.put(`/shop/products/${editing.id}`, { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock) })
      setEditMsg('✓ Producto actualizado')
      api.get('/shop/products').then(r => setProducts(r.data.data.products))
    } catch (err) {
      setEditMsg('✗ ' + (err.response?.data?.error || 'Error'))
    } finally { setEditSaving(false) }
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/shop/orders/${id}/status`, { status })
    api.get('/shop/orders').then(r => setOrders(r.data.data.orders))
  }

  const openOrderDetail = async (id) => {
    setOrderDetailLoading(true)
    try {
      const { data } = await api.get(`/shop/orders/${id}`)
      setOrderDetail(data.data.order)
    } catch { alert('Error al cargar la orden') }
    finally { setOrderDetailLoading(false) }
  }

  const CATEGORY_LABEL = { accesorios: 'Accesorios', ropa: 'Ropa', barberia: 'Barbería' }
  const STATUS_COLOR   = { pending: '#F59E0B', completed: '#10B981', cancelled: '#EF4444' }
  const STATUS_LABEL   = { pending: 'Pendiente', completed: 'Completada', cancelled: 'Cancelada' }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--black)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.85rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  const filteredProducts = products.filter(p => {
    const matchCat    = catFilter === '' || p.category === catFilter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const outOfStock = products.filter(p => p.stock === 0)

  return (
    <div>
      <span className="section-label">✦ Tienda</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 24px' }}>
        Gestión de Tienda
      </h2>

      <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'products', label: `Productos (${products.length})` },
          { key: 'add',      label: '+ Agregar Producto' },
          { key: 'orders',   label: `Pedidos (${orders.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '12px 24px', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.key ? 'var(--gold)' : 'transparent'}`,
            color: tab === t.key ? 'var(--gold)' : 'var(--white-muted)',
            fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.3s', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {outOfStock.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', padding: '14px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: '#F59E0B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>⚠ Productos sin stock</div>
          {outOfStock.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>{p.name}</span>
              <button className="btn-gold" onClick={() => { openEdit(p); setTab('products') }} style={{ padding: '4px 12px', fontSize: '0.65rem' }}>Actualizar stock</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder=" Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '10px 16px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: '0.85rem', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {['', 'accesorios', 'ropa', 'barberia'].map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)} className={catFilter === cat ? 'btn-gold' : 'btn-outline'} style={{ padding: '8px 16px', fontSize: '0.72rem' }}>
                {cat === '' ? 'Todos' : cat === 'accesorios' ? 'Accesorios' : cat === 'ropa' ? 'Ropa' : 'Cuidado Personal'}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--white-muted)' }}>No se encontraron productos</p>
            </div>
          ) : (
            Object.entries(filteredProducts.reduce((acc, p) => { if (!acc[p.category]) acc[p.category] = []; acc[p.category].push(p); return acc }, {})).map(([cat, prods]) => (
              <div key={cat} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--gold)', margin: 0 }}>
                    {CATEGORY_LABEL[cat]} <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)', fontFamily: 'DM Sans, sans-serif' }}>({prods.length})</span>
                  </h3>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {prods.map(p => (
                    <div key={p.id} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', transition: 'border-color 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--black-soft)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                          {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '📦'}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '3px' }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginBottom: '3px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                          <span style={{ fontSize: '0.68rem', color: p.stock < 5 ? '#F59E0B' : 'var(--white-muted)' }}>{p.stock === 0 ? '✕ Sin stock' : `Stock: ${p.stock}`}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>${Number(p.price).toLocaleString('es-CO')}</div>
                        <button onClick={() => openEdit(p)} className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.68rem' }}>Editar</button>
                        <button onClick={() => { if (confirm('¿Eliminar este producto?')) api.put(`/shop/products/${p.id}`, { is_active: 0 }).then(() => api.get('/shop/products').then(r => setProducts(r.data.data.products))) }}
                          style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', padding: '6px 12px', fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'add' && (
        <div style={{ maxWidth: '520px' }}>
          {msg && <div style={{ padding: '10px 14px', marginBottom: '20px', fontSize: '0.82rem', background: msg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`, color: msg.startsWith('✓') ? '#6ee7b7' : '#fc8181' }}>{msg}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'name', label: 'Nombre', type: 'text', required: true },
              { key: 'description', label: 'Descripción', type: 'text', required: false },
              { key: 'price', label: 'Precio', type: 'number', required: true },
              { key: 'stock', label: 'Stock', type: 'number', required: true },
              { key: 'image_url', label: 'URL imagen', type: 'url', required: false },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} required={f.required} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="accesorios">Accesorios</option>
                <option value="ropa">Ropa</option>
                <option value="barberia">Cuidado Personal</option>
              </select>
            </div>
            <button type="submit" className="btn-gold" disabled={saving} style={{ marginTop: '8px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Creando...' : 'Crear Producto'}</button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {orders.length === 0 ? (
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--white-muted)' }}>No hay pedidos todavía</p>
            </div>
          ) : orders.map(o => {
            const sc = STATUS_COLOR[o.status] || '#6B7280'
            return (
              <div key={o.id} onClick={() => openOrderDetail(o.id)}
                style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', cursor: 'pointer', transition: 'border-color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '2px' }}>Orden #{o.id} — {o.client_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>{o.item_count} productos · {new Date(o.created_at).toLocaleDateString('es-CO')}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)' }}>${Number(o.total).toLocaleString('es-CO')}</div>
                  <div style={{ padding: '4px 10px', border: `1px solid ${sc}33`, background: `${sc}11`, fontSize: '0.68rem', color: sc, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{STATUS_LABEL[o.status]}</div>
                  {o.status === 'pending' && (
                    <>
                      <button className="btn-gold" onClick={e => { e.stopPropagation(); updateStatus(o.id, 'completed') }} style={{ padding: '6px 12px', fontSize: '0.68rem' }}>Completar</button>
                      <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'cancelled') }} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', padding: '6px 12px', fontSize: '0.68rem', cursor: 'pointer', transition: 'all 0.3s' }}>Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <span className="section-label">✦ Editando producto</span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)', marginTop: '4px' }}>{editing.name}</h3>
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Nombre', type: 'text', required: true },
                { key: 'description', label: 'Descripción', type: 'text', required: false },
                { key: 'price', label: 'Precio', type: 'number', required: true },
                { key: 'stock', label: 'Stock', type: 'number', required: true },
                { key: 'image_url', label: 'URL imagen', type: 'url', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} value={editForm[f.key]} required={f.required} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>Categoría</label>
                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="accesorios">Accesorios</option>
                  <option value="ropa">Ropa</option>
                  <option value="barberia">Cuidado Personal</option>
                </select>
              </div>
              {editMsg && <div style={{ padding: '10px 14px', fontSize: '0.82rem', background: editMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${editMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`, color: editMsg.startsWith('✓') ? '#6ee7b7' : '#fc8181' }}>{editMsg}</div>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-outline" onClick={() => setEditing(null)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-gold" disabled={editSaving} style={{ flex: 1, opacity: editSaving ? 0.7 : 1 }}>{editSaving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setOrderDetail(null) }}>
          <div style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <span className="section-label">✦ Detalle</span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)', marginTop: '4px' }}>Orden #{orderDetail.id} — {orderDetail.client_name}</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginTop: '4px' }}>{new Date(orderDetail.created_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}</div>
              </div>
              <button onClick={() => setOrderDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
              {orderDetail.items.map((item, i) => (
                <div key={i} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--white)', marginBottom: '3px' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{CATEGORY_LABEL[item.category] || item.category}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', marginBottom: '2px' }}>{item.quantity} × ${Number(item.unit_price).toLocaleString('es-CO')}</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--gold)' }}>${Number(item.unit_price * item.quantity).toLocaleString('es-CO')}</div>
                  </div>
                </div>
              ))}
            </div>
            {orderDetail.notes && <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--white-muted)' }}>📝 {orderDetail.notes}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--gold)' }}>${Number(orderDetail.total).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      )}

      {orderDetailLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>Cargando orden...</div>
        </div>
      )}
    </div>
  )
}

// ── Servicios ──────────────────────────────────────────────────
function SectionServices() {
  const [services,      setServices]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editing,       setEditing]       = useState(null)
  const [form,          setForm]          = useState({ name: '', description: '', duration_minutes: '', price: '', display_order: '' })
  const [saving,        setSaving]        = useState(false)
  const [msg,           setMsg]           = useState('')
  const [imageFile,     setImageFile]     = useState(null)
  const [imagePreview,  setImagePreview]  = useState(null)

  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--black)', border: '1px solid var(--border)',
    color: 'var(--white)', fontSize: '0.85rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.3s',
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/services')
      setServices(data.data.services)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '', duration_minutes: '', price: '', display_order: '' })
    setMsg('')
    setImageFile(null)
    setImagePreview(null)
    setEditing('create')
  }

  const openEdit = (svc) => {
    setForm({ name: svc.name, description: svc.description || '', duration_minutes: svc.duration_minutes, price: svc.price, display_order: svc.display_order || 0 })
    setMsg('')
    setImageFile(null)
    setImagePreview(svc.image_url ? svc.image_url : null)
    setEditing(svc)
  }

  const closeModal = () => {
    setEditing(null)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration_minutes) {
      setMsg('✗ Nombre, precio y duración son obligatorios')
      return
    }
    setSaving(true); setMsg('')
    try {
      const payload = { ...form, price: parseFloat(form.price), duration_minutes: parseInt(form.duration_minutes), display_order: parseInt(form.display_order) || 0 }

      let savedId
      if (editing === 'create') {
        const { data } = await api.post('/admin/services', payload)
        savedId = data.data.service.id
      } else {
        await api.put(`/admin/services/${editing.id}`, payload)
        savedId = editing.id
      }

      if (imageFile && savedId) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await api.post(`/services/${savedId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setMsg('✓ Servicio guardado correctamente')
      await fetchServices()
      setTimeout(closeModal, 800)
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.error || 'Error al guardar'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (svc) => {
    if (!confirm(`¿Desactivar el servicio "${svc.name}"?`)) return
    try {
      await api.delete(`/admin/services/${svc.id}`)
      fetchServices()
    } catch { alert('No se pudo desactivar') }
  }

  return (
    <div>
      <span className="section-label">✦ Gestión</span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', margin: '8px 0 24px' }}>Servicios</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="btn-gold" onClick={openCreate} style={{ padding: '10px 24px', fontSize: '0.78rem' }}>
          + Nuevo servicio
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--white-muted)', fontSize: '0.85rem' }}>Cargando...</p>
      ) : services.length === 0 ? (
        <div style={{ background: 'var(--black-card)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--white-muted)' }}>No hay servicios activos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {services.map(svc => (
            <div key={svc.id} style={{
              background: 'var(--black-card)', border: '1px solid var(--border)',
              padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px', transition: 'border-color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                {svc.image_url ? (
                  <img src={svc.image_url} alt={svc.name} style={{
                    width: '44px', height: '44px', objectFit: 'cover',
                    border: '1px solid rgba(201,168,76,0.2)', flexShrink: 0,
                  }} />
                ) : (
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                    border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  }}>✂</div>
                )}

                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--white)', marginBottom: '3px' }}>{svc.name}</div>
                  {svc.description && <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginBottom: '3px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</div>}
                  <span style={{ fontSize: '0.68rem', color: 'var(--white-muted)' }}>⏱ {svc.duration_minutes} min</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
                  ${Number(svc.price).toLocaleString('es-CO')}
                </div>
                <button onClick={() => openEdit(svc)} className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.68rem' }}>Editar</button>
                <button onClick={() => handleDelete(svc)} style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181',
                  padding: '6px 12px', fontSize: '0.68rem', cursor: 'pointer',
                  letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s',
                }}>Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <span className="section-label">✦ {editing === 'create' ? 'Nuevo servicio' : 'Editando servicio'}</span>
                {editing !== 'create' && <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)', marginTop: '4px' }}>{editing.name}</h3>}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name',             label: 'Nombre *',            type: 'text'   },
                { key: 'description',      label: 'Descripción',         type: 'text'   },
                { key: 'price',            label: 'Precio (COP) *',      type: 'number' },
                { key: 'duration_minutes', label: 'Duración (min) *',    type: 'number' },
                { key: 'display_order',    label: 'Orden visualización', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '6px' }}>
                  Imagen del servicio
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" style={{
                    width: '100%', height: '160px', objectFit: 'cover',
                    marginBottom: '10px', borderRadius: '4px',
                    border: '1px solid var(--border)',
                  }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (file) {
                      setImageFile(file)
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
                  style={{ ...inputStyle, padding: '8px', cursor: 'pointer' }}
                />
              </div>

              {msg && <div style={{ padding: '10px 14px', fontSize: '0.82rem', background: msg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`, color: msg.startsWith('✓') ? '#6ee7b7' : '#fc8181' }}>{msg}</div>}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-outline" onClick={closeModal} style={{ flex: 1 }}>Cancelar</button>
                <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Guardando...' : editing === 'create' ? 'Crear servicio' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}