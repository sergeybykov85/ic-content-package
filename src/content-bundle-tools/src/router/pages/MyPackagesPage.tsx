import type { FC } from 'react'
import MyPackages from '~/components/features/MyPackages/MyPackages.tsx'
import SectionLayout from '~/components/layouts/SectionLayout'

const MyPackagesPage: FC = () => {
  return (
    <SectionLayout
      title="My packages"
      button={{
        text: 'Deploy new package',
        link: '',
      }}
    >
      <MyPackages />
    </SectionLayout>
  )
}

export default MyPackagesPage
