import { type FC, useCallback, useMemo } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import PackageDetailsBlock from '~/components/features/PackageDetailsBlock'
import BundlesList from '~/components/features/BundlesList'
import CopyBtn from '~/components/general/CopyBtn'
import { useServices } from '~/context/ServicesContext'

const PackageDetailsPage: FC = () => {
  const { packageId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(state?.backToListPath), [navigate, state?.backToListPath])

  const { initBundlePackageService } = useServices()
  const bundlePackageService = useMemo(() => {
    return packageId && initBundlePackageService ? initBundlePackageService(packageId) : null
  }, [initBundlePackageService, packageId])

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
      <If condition={Boolean(bundlePackageService)}>
        <PackageDetailsBlock bundlePackageService={bundlePackageService!} />
        <BundlesList bundlePackageService={bundlePackageService!} />
      </If>
    </SectionLayout>
  )
}

export default PackageDetailsPage
