import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const CATEGORY_LABEL = {
  accesorios: { label: 'Accesorios' },
  ropa:       { label: 'Ropa' },
  barberia:   { label: 'Cuidado Personal' },
}

/* ─── Product Detail Modal ─────────────────────────────────────────── */
function ProductModal({ product, cart, onClose, onAdd, onUpdateQty }) {
  const inCart     = cart.find(i => i.id === product.id)
  const outOfStock = product.stock === 0

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const btnQty = {
    width: '36px', height: '36px', flexShrink: 0,
    background: 'var(--black-soft)', border: '1px solid var(--border)',
    color: 'var(--white)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', lineHeight: 1, transition: 'border-color 0.2s',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div style={{
        background: 'var(--black-soft)', border: '1px solid var(--border)',
        width: '100%', maxWidth: '720px', maxHeight: '90vh',
        overflowY: 'auto', position: 'relative',
        animation: 'slideUp 0.25s ease',
      }}>

        {/* Close btn */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)',
            color: 'var(--white-muted)', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--white-muted)'}
        >✕</button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Image */}
          <div style={{
            height: '280px', background: 'var(--black)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem', overflow: 'hidden', flexShrink: 0,
          }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span style={{ opacity: 0.4 }}>
                {CATEGORY_LABEL[product.category]?.icon || '◈'}
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <span className="section-label">
                ✦ {CATEGORY_LABEL[product.category]?.label || product.category}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.8rem', color: 'var(--white)',
                lineHeight: 1.2, margin: 0,
              }}>
                {product.name}
              </h2>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '2rem', color: 'var(--gold)',
                flexShrink: 0,
              }}>
                ${Number(product.price).toLocaleString('es-CO')}
              </div>
            </div>

            {product.description && (
              <p style={{
                fontSize: '0.9rem', color: 'var(--white-muted)',
                lineHeight: '1.7', margin: 0,
                borderLeft: '2px solid var(--border)',
                paddingLeft: '16px',
              }}>
                {product.description}
              </p>
            )}

            <div style={{ height: '1px', background: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {outOfStock ? (
                <span style={{ fontSize: '0.78rem', color: '#fc8181', letterSpacing: '0.08em' }}>
                  ✕ Producto agotado
                </span>
              ) : product.stock < 5 ? (
                <span style={{ fontSize: '0.78rem', color: '#F59E0B', letterSpacing: '0.08em' }}>
                  ⚠ Últimas {product.stock} unidades
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#6ee7b7', letterSpacing: '0.08em' }}>
                  ✓ En stock
                </span>
              )}
            </div>

            {!outOfStock && (
              inCart ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button
                    onClick={() => onUpdateQty(product.id, inCart.quantity - 1)}
                    style={btnQty}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >−</button>
                  <span style={{
                    width: '60px', textAlign: 'center',
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.2rem', color: 'var(--gold)',
                    border: '1px solid var(--border)',
                    borderLeft: 'none', borderRight: 'none',
                    lineHeight: '36px', height: '36px', display: 'inline-block',
                  }}>{inCart.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(product.id, inCart.quantity + 1)}
                    style={btnQty}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >+</button>
                  <span style={{ marginLeft: '16px', fontSize: '0.78rem', color: '#6ee7b7' }}>
                    ✓ En tu carrito
                  </span>
                </div>
              ) : (
                <button
                  className="btn-gold"
                  onClick={() => { onAdd(product); onClose() }}
                  style={{ padding: '14px 32px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
                >
                  + Agregar al carrito
                </button>
              )
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--white-muted)', paddingTop: '4px' }}>
              💳 Pago presencial en caja al momento de recoger
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Shop Component ───────────────────────────────────────────── */
export default function Shop() {
  const { user }                      = useAuth()
  const [products, setProducts]       = useState([])
  const [cart, setCart]               = useState([])
  const [category, setCategory]       = useState('')
  const [loading, setLoading]         = useState(true)
  const [cartOpen, setCartOpen]       = useState(false)
  const [ordering, setOrdering]       = useState(false)
  const [success, setSuccess]         = useState(null)
  const [notes, setNotes]             = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const navigate                      = useNavigate()

  useEffect(() => {
    api.get('/shop/products', { params: category ? { category } : {} })
      .then(r => setProducts(r.data.data?.products || []))
      .catch(err => console.error('ERROR SHOP:', err))
      .finally(() => setLoading(false))
  }, [category])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const total      = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
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

  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  const btnQty = {
    width: '28px', height: '28px', flexShrink: 0,
    background: 'var(--black-soft)', border: '1px solid var(--border)',
    color: 'var(--white)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', lineHeight: 1,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '80px' }}>

      {/* Estilos del hover overlay */}
      <style>{`
        .product-card-img-wrapper {
          position: relative;
          height: 160px;
          background: var(--black-soft);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-card-img-wrapper .hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          backdrop-filter: blur(2px);
        }

        .product-card:hover .hover-overlay {
          opacity: 1;
        }

        .hover-overlay-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          transform: translateY(6px);
          transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s, border-color 0.2s;
        }

        .product-card:hover .hover-overlay-btn {
          transform: translateY(0);
        }

        .hover-overlay-btn:hover {
          background: rgba(var(--gold-rgb, 212,175,55), 0.15);
          border-color: var(--gold);
          color: var(--gold);
        }

        .hover-overlay-btn svg {
          flex-shrink: 0;
          transition: transform 0.2s;
        }

        .hover-overlay-btn:hover svg {
          transform: scale(1.15);
        }
      `}</style>

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
              <button
                className="btn-gold"
                onClick={() => setCartOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🛒 Carrito
                {totalItems > 0 && (
                  <span style={{
                    background: 'rgba(0,0,0,0.3)', color: 'var(--white)',
                    width: '20px', height: '20px', borderRadius: '50%',
                    fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontFamily: 'DM Sans, sans-serif',
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

        {/* Filtros */}
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
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2px' }}>
                  {prods.map(p => {
                    const inCart     = cart.find(i => i.id === p.id)
                    const outOfStock = p.stock === 0
                    return (
                      <div
                        key={p.id}
                        className="card-hover product-card"
                        style={{
                          background: 'var(--black-card)', border: '1px solid var(--border)',
                          padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
                          opacity: outOfStock ? 0.5 : 1,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedProduct(p)}
                      >
                        {/* Imagen con hover overlay */}
                        <div className="product-card-img-wrapper">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <span>{CATEGORY_LABEL[p.category]?.icon}</span>
                          )}

                          {/* Overlay de hover */}
                          {!outOfStock && (
                            <div className="hover-overlay">
                              <button className="hover-overlay-btn">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                Ver producto
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--white)', marginBottom: '4px' }}>
                            {p.name}
                          </div>
                        </div>

                        {/* Stock */}
                        <div style={{ fontSize: '0.68rem', color: p.stock < 5 ? '#F59E0B' : 'var(--white-muted)', letterSpacing: '0.05em' }}>
                          {outOfStock ? '✕ Agotado' : user?.role === 'admin' ? `${p.stock} disponibles` : null}
                        </div>

                        {/* Precio y botón */}
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
                            ${Number(p.price).toLocaleString('es-CO')}
                          </div>
                          {user?.role === 'admin' ? null : outOfStock ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--white-muted)' }}>Agotado</span>
                          ) : inCart ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button onClick={() => updateQty(p.id, inCart.quantity - 1)} style={btnQty}>−</button>
                              <span style={{
                                fontSize: '0.9rem', color: 'var(--gold)', fontFamily: 'Playfair Display, serif',
                                width: '28px', textAlign: 'center', flexShrink: 0,
                              }}>{inCart.quantity}</span>
                              <button onClick={() => updateQty(p.id, inCart.quantity + 1)} style={btnQty}>+</button>
                            </div>
                          ) : (
                            <button
                              className="btn-gold"
                              onClick={e => { e.stopPropagation(); addToCart(p) }}
                              style={{ padding: '8px 16px', fontSize: '0.72rem' }}
                            >
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

      {/* ─── Product Detail Modal ─── */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cart={cart}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          onUpdateQty={updateQty}
        />
      )}

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
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={btnQty}>−</button>
                        <span style={{
                          fontSize: '0.9rem', color: 'var(--gold)', fontFamily: 'Playfair Display, serif',
                          width: '28px', textAlign: 'center', flexShrink: 0,
                        }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={btnQty}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{
                          ...btnQty,
                          background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#fc8181', fontSize: '0.8rem',
                        }}>✕</button>
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
