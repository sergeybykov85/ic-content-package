import type { FC } from 'react'
import { useAuth } from '~/recoil/auth'
import { Navigate } from 'react-router-dom'
import MainLayout from '~/components/layouts/MainLayout'
import WelcomeSection from '~/components/features/WelcomeSection'

const WelcomePage: FC = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? (
    <Navigate to="/" />
  ) : (
    <MainLayout>
      <WelcomeSection />
    </MainLayout>
  )
}

export default WelcomePage
