import type { FC } from 'react'
import MyPackages from '~/components/features/MyPackages/MyPackages.tsx'
import SectionLayout from '~/components/layouts/SectionLayout'
import DeployNewPackageBtn from '~/components/features/DeployNewPackageBtn'

const MyPackagesPage: FC = () => {
  return (
    <SectionLayout title="My packages" rightElement={<DeployNewPackageBtn />}>
      <MyPackages />
    </SectionLayout>
  )
}

export default MyPackagesPage
