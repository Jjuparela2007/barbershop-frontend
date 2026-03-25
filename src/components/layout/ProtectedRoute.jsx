import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth()

  if (!ready) return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.3em' }}>
        CARGANDO...
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace/>

  return children
}