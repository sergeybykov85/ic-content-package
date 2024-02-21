import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import DeployPackageForm from '~/components/features/DeployPackageForm'

const DeployPackagePage: FC = () => (
  <SectionLayout title="Deploy new package">
    <DeployPackageForm />
  </SectionLayout>
)

export default DeployPackagePage
