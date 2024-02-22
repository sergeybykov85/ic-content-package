import { type FC, useCallback } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import PackageDetailsBlock from '~/components/features/PackageDetailsBlock'
import BundlesList from '~/components/features/BundlesList'
import CopyBtn from '~/components/general/CopyBtn'

const PackageDetailsPage: FC = () => {
  const { packageId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(state?.backToListPath), [navigate, state?.backToListPath])

  if (!packageId) {
    return <Navigate to="/" replace />
  }
  return (
    <SectionLayout
      title={
        <>
          Package ID: {packageId} <CopyBtn text={packageId} />
        </>
      }
      rightElement={
        <If condition={state?.backToListPath}>
          <Button variant="text" onClick={goBack}>
            Back to the list
          </Button>
        </If>
      }
    >
      <PackageDetailsBlock packageId={packageId} />
      <BundlesList packageId={packageId} />
    </SectionLayout>
  )
}

export default PackageDetailsPage