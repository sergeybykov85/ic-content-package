import { type FC, useCallback, useMemo } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import SectionLayout from '~/components/layouts/SectionLayout'
import Button from '~/components/general/Button'
import BundleDetailsBlock from '~/components/features/BundleDetailsBlock'
import CopyBtn from '~/components/general/CopyBtn'

const BundleDetailsPage: FC = () => {
  const { bundleId = '', packageId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => {
    state?.backToList ? navigate(-1) : navigate(`/package/${packageId}/`)
  }, [navigate])

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
        <Button variant="text" onClick={goBack}>
          Back to the list
        </Button>
      }
    >
      <BundleDetailsBlock {...{ bundleId, packageId }} />
    </SectionLayout>
  )
}

export default BundleDetailsPage
