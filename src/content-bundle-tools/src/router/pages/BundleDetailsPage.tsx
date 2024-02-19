import { type FC, useCallback } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import SectionLayout from '~/components/layouts/SectionLayout'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import { useAuth } from '~/context/AuthContext'
import BundleDetailsBlock from '~/components/features/BundleDetailsBlock'

const BundleDetailsPage: FC = () => {
  const { bundleId, packageId } = useParams()
  const { isAuthenticated } = useAuth()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])

  if (!bundleId || !packageId) {
    return <Navigate to="/" replace />
  }
  return (
    <SectionLayout
      title="Bundle"
      rightElement={
        <If condition={state?.backToList && isAuthenticated}>
          <Button variant="text" onClick={goBack}>
            Back to the list
          </Button>
        </If>
      }
    >
      <BundleDetailsBlock {...{ bundleId, packageId }} />
    </SectionLayout>
  )
}

export default BundleDetailsPage
