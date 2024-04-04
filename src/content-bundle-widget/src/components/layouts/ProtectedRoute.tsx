import type { FC } from 'react'
import { useAuth } from '~/context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { FullScreenLoader } from '~/components/general/Loaders'

const ProtectedRoute: FC = () => {
  const { isAuthenticated, authReady } = useAuth()
  if (!authReady) {
    return <FullScreenLoader />
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" replace />
}

export default ProtectedRoute
