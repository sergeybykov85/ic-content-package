import { type FC } from 'react'
import MainLayout from '~/components/layouts/MainLayout'
import PublicPackages from '~/components/features/PublicPackages'

const PublicPackagesPage: FC = () => {
  return (
    <MainLayout>
      <PublicPackages />
    </MainLayout>
  )
}

export default PublicPackagesPage
