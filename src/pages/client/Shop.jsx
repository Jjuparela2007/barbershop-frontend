import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const CATEGORY_LABEL = {
  accesorios: { label: 'Accesorios',           },
  ropa:       { label: 'Ropa',                 },
  barberia:   { label: 'Productos Barbería',   },
}

export default function Shop() {
  const { user }                    = useAuth()
  const [products, setProducts]     = useState([])
  const [cart, setCart]             = useState([])
  const [category, setCategory]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [cartOpen, setCartOpen]     = useState(false)
  const [ordering, setOrdering]     = useState(false)
  const [success, setSuccess]       = useState(null)
  const [notes, setNotes]           = useState('')
  const navigate                    = useNavigate()

  useEffect(() => {
    api.get('/shop/products', { params: category ? { category } : {} })
      .then(r => setProducts(r.data.data.products))
      .finally(() => setLoading(false))
  }, [category])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    setOrdering(true)
    try {
      const { data } = await api.post('/shop/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
        notes,
      })
      setSuccess(data.data.order)
      setCart([])
      setCartOpen(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al procesar la orden')
    } finally { setOrdering(false) }
  }

  // Agrupar por categoría
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Header */}
      <div style={{ background: 'var(--black-soft)', borderBottom: '1px solid var(--border)', padding: '24px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="section-label">✦ Tienda</span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--white)', marginTop: '8px' }}>
              Nuestra Tienda
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user && (
              <Link to="/client">
                <button className="btn-outline" style={{ padding: '10px 20px' }}>← Mi Panel</button>
              </Link>
            )}
            {user?.role !== 'admin' && (
  <button className="btn-gold" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
    🛒 Carrito
    {totalItems > 0 && (
      <span style={{
        position: 'absolute', top: '-8px', right: '-8px',
        background: '#EF4444', color: 'white',
        width: '20px', height: '20px', borderRadius: '50%',
        fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700',
      }}>{totalItems}</span>
    )}
  </button>
)}
                
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%' }}>

        {/* Orden exitosa */}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            padding: '24px 28px', marginBottom: '32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', color: '#6ee7b7', marginBottom: '4px' }}>
                ✓ Orden #{success.id} registrada correctamente
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--white-muted)' }}>
                Total: ${Number(success.total).toLocaleString('es-CO')} · Pago presencial en caja
              </div>
            </div>
            <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
        )}

        {/* Filtros por categoría */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {[{ key: '', label: 'Todo', icon: '◈' }, ...Object.entries(CATEGORY_LABEL).map(([k, v]) => ({ key: k, ...v }))].map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={category === cat.key ? 'btn-gold' : 'btn-outline'}
              style={{ padding: '10px 20px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--white-muted)' }}>Cargando productos...</p>
        ) : (
          <div>
            {Object.entries(grouped).map(([cat, prods]) => (
              <div key={cat} style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{CATEGORY_LABEL[cat]?.icon}</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--white)' }}>
                    {CATEGORY_LABEL[cat]?.label}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}/>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2px' }}>
                  {prods.map(p => {
                    const inCart = cart.find(i => i.id === p.id)
                    const outOfStock = p.stock === 0
                    return (
                      <div key={p.id} className="card-hover" style={{
                        background: 'var(--black-card)', border: '1px solid var(--border)',
                        padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
                        opacity: outOfStock ? 0.5 : 1,
                      }}>
                        {/* Imagen o placeholder */}
                        <div style={{
                          height: '160px', background: 'var(--black-soft)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '3rem', overflow: 'hidden',
                        }}>
                          {p.image_url ? (
  <img src={p.image_url} alt={p.name}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
  />
) : (
  <span>{CATEGORY_LABEL[p.category]?.icon}</span>
)}
                        </div>

                        {/* Info */}
                        <div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '4px' }}>
                            {p.name}
                          </div>
                          {p.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--white-muted)', lineHeight: '1.5' }}>{p.description}</div>
                          )}
                        </div>

                        {/* Stock */}
                        <div style={{ fontSize: '0.68rem', color: p.stock < 5 ? '#F59E0B' : 'var(--white-muted)', letterSpacing: '0.05em' }}>
                          {outOfStock ? '✕ Sin stock' : `${p.stock} disponibles`}
                        </div>

                        {/* Precio y botón */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
    ${Number(p.price).toLocaleString('es-CO')}
  </div>
  {user?.role === 'admin' ? null : outOfStock ? (
    <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>Agotado</span>
  ) : inCart ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => updateQty(p.id, inCart.quantity - 1)}
        style={{ width: '28px', height: '28px', background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--white)', cursor: 'pointer', fontSize: '1rem' }}>−</button>
      <span style={{ fontSize: '0.9rem', color: 'var(--gold)', minWidth: '20px', textAlign: 'center' }}>{inCart.quantity}</span>
      <button onClick={() => updateQty(p.id, inCart.quantity + 1)}
        style={{ width: '28px', height: '28px', background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--white)', cursor: 'pointer', fontSize: '1rem' }}>+</button>
    </div>
  ) : (
    <button className="btn-gold" onClick={() => addToCart(p)} style={{ padding: '8px 16px', fontSize: '0.72rem' }}>
      + Agregar
    </button>
  )}
</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      {cartOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        }} onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 'min(420px, 100vw)',
            background: 'var(--black-soft)', borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header carrito */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="section-label">✦ Tu selección</span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--white)', marginTop: '4px' }}>Carrito</h3>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '48px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                  <p style={{ color: 'var(--white-muted)', fontSize: '0.9rem' }}>Tu carrito está vacío</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      background: 'var(--black-card)', border: '1px solid var(--border)',
                      padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--white)', marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>${Number(item.price).toLocaleString('es-CO')} c/u</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}
                          style={{ width: '26px', height: '26px', background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--white)', cursor: 'pointer' }}>−</button>
                        <span style={{ fontSize: '0.9rem', color: 'var(--white)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}
                          style={{ width: '26px', height: '26px', background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--white)', cursor: 'pointer' }}>+</button>
                        <button onClick={() => removeFromCart(item.id)}
                          style={{ width: '26px', height: '26px', background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer carrito */}
            {cart.length > 0 && (
              <div style={{ padding: '24px 28px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '8px' }}>
                    Notas (opcional)
                  </label>
                  <input value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Ej: Entregar en caja..."
                    style={{
                      width: '100%', padding: '10px 14px', marginBottom: '16px',
                      background: 'var(--black-card)', border: '1px solid var(--border)',
                      color: 'var(--white)', fontSize: '0.85rem', outline: 'none',
                      fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--white-muted)' }}>Total ({totalItems} items)</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--gold)' }}>
                    ${total.toLocaleString('es-CO')}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', marginBottom: '16px', textAlign: 'center' }}>
                  💳 Pago presencial en caja al momento de recoger
                </div>

                {!user ? (
                  <Link to="/login">
                    <button className="btn-gold" style={{ width: '100%' }}>Iniciar sesión para pedir</button>
                  </Link>
                ) : (
                  <button className="btn-gold" onClick={handleOrder} disabled={ordering}
                    style={{ width: '100%', opacity: ordering ? 0.7 : 1 }}>
                    {ordering ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}