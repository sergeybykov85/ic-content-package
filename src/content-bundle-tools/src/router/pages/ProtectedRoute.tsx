import type { FC } from 'react'
import { useAuth } from '~/recoil/auth'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute: FC = () => {
  const { isAuthenticated, authReady } = useAuth()
  console.log(isAuthenticated)
  if (!authReady) {
    return null // TODO: Loading...
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" replace />
}

export default ProtectedRoute
