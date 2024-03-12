import { type FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { CreateBundleForm } from '~/components/features/BundleForms'
import { useParams } from 'react-router-dom'

const DeployBundlePage: FC = () => {
  const { packageId } = useParams()
  return (
    <SectionLayout title="Create new bundle">
      <CreateBundleForm packageId={packageId!} />
    </SectionLayout>
  )
}

export default DeployBundlePage
