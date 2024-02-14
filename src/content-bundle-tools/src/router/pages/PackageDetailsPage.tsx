import { type FC, useCallback } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import PackageDetailsBlock from '~/components/features/PackageDetailsBlock'

const PackageDetailsPage: FC = () => {
  const { packageId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])

  if (!packageId) {
    return <Navigate to="/" replace />
  }
  return (
    <SectionLayout
      title={`Package ID ${packageId}`}
      rightElement={
        <If condition={state?.backToList}>
          <Button variant="text" onClick={goBack}>
            Back to the list
          </Button>
        </If>
      }
    >
      <PackageDetailsBlock packageId={packageId} />
    </SectionLayout>
  )
}

export default PackageDetailsPage
