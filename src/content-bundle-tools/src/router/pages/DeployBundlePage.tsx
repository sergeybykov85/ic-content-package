import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import DeployBundleForm from '~/components/features/DeployBundleForm'
import { useParams } from 'react-router-dom'

const DeployBundlePage: FC = () => {
  const { packageId } = useParams()
  return (
    <SectionLayout title="Deploy new bundle">
      <DeployBundleForm packageId={packageId!} />
    </SectionLayout>
  )
}

export default DeployBundlePage
