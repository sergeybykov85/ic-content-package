import type { FC } from 'react'
import MyPackages from '~/components/features/MyPackages/MyPackages.tsx'
import SectionLayout from '~/components/layouts/SectionLayout'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'

const MyPackagesPage: FC = () => {
  return (
    <SectionLayout
      title="My packages"
      rightElement={
        <Link to="/deploy-package">
          <Button text="Deploy new package" />
        </Link>
      }
    >
      <MyPackages />
    </SectionLayout>
  )
}

export default MyPackagesPage
