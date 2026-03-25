import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar          from './components/layout/Navbar'
import Landing         from './pages/Landing'
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import ClientDashboard from './pages/client/ClientDashboard'
import BookAppointment from './pages/client/BookAppointment'
import ProtectedRoute  from './components/layout/ProtectedRoute'
import BarberDashboard from './pages/barber/BarberDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import BarberProfile from './pages/BarberProfile'
import Profile from './pages/client/Profile'
import Shop from './pages/client/Shop'


export default function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/"         element={<Landing/>}  />
        <Route path="/login"    element={<Login/>}    />
        <Route path="/register" element={<Register/>} />
        <Route path="/barber/:id" element={<BarberProfile/>}/>
        <Route path="/shop" element={<Shop/>}/>
        
        <Route path="/client/profile" element={
        <ProtectedRoute roles={['client']}>
        <Profile/>
        </ProtectedRoute>
        }/>
        <Route path="/client" element={
          <ProtectedRoute roles={['client']}>
            <ClientDashboard/>
          </ProtectedRoute>
        }/>
        <Route path="/client/book" element={
          <ProtectedRoute roles={['client']}>
            <BookAppointment/>
          </ProtectedRoute>
        }/>
        <Route path="/barber" element={
          <ProtectedRoute roles={['barber']}>
            <BarberDashboard/>
          </ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard/>
          </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>
  )
}