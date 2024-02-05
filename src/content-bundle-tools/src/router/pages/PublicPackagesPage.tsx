import { type FC } from 'react'
import MainLayout from '~/components/layouts/MainLayout'
import Packages from '~/components/features/Packages'

const PublicPackagesPage: FC = () => {
  return (
    <MainLayout>
      <Packages type="public" />
    </MainLayout>
  )
}

export default PublicPackagesPage
