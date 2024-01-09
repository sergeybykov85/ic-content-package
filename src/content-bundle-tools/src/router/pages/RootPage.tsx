import MainLayout from 'components/layouts/MainLayout'
import WelcomeSection from 'components/features/WelcomeSection'
import type { FC } from 'react'

const RootPage: FC = () => (
  <MainLayout>
    <WelcomeSection />
  </MainLayout>
)

export default RootPage
