import type { FC } from 'react'
import { useAuth } from '~/context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute: FC = () => {
  const { isAuthenticated, authReady } = useAuth()
  if (!authReady) {
    return null // TODO: Loading...
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" replace />
}

export default ProtectedRoute
