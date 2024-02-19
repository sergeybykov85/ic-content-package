import { type FC, useCallback, useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import SectionLayout from '~/components/layouts/SectionLayout'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import { useAuth } from '~/context/AuthContext'
import BundleDetailsBlock from '~/components/features/BundleDetailsBlock'
import CopyBtn from '~/components/general/CopyBtn'

const BundleDetailsPage: FC = () => {
  const { bundleId = '', packageId } = useParams()
  const { isAuthenticated } = useAuth()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])

  const bundleIdToRender = useMemo(() => {
    return bundleId?.length > 30 ? `${bundleId?.slice(0, 20)}...` : bundleId
  }, [bundleId])

  if (!bundleId || !packageId) {
    return <Navigate to="/" replace />
  }
  return (
    <SectionLayout
      title={
        <>
          Bundle ID: {bundleIdToRender} <CopyBtn text={bundleId} />
        </>
      }
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
