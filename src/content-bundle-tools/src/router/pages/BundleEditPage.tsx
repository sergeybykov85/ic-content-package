import { type FC, useMemo } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import SectionLayout from '~/components/layouts/SectionLayout'
import Button from '~/components/general/Button'
import CopyBtn from '~/components/general/CopyBtn'
import { EditBundleForm } from '~/components/features/BundleForms'

const BundleEditPage: FC = () => {
  const { packageId = '', bundleId = '' } = useParams()
  const { state } = useLocation()

  const bundleIdToRender = useMemo(() => {
    return bundleId?.length > 30 ? `${bundleId?.slice(0, 20)}...` : bundleId
  }, [bundleId])

  if (!state?.dataToEdit) {
    return <Navigate to={`/package/${packageId}/bundle/${bundleId}`} state={state} />
  }

  return (
    <SectionLayout
      title={
        <>
          Edit bundle: {bundleIdToRender} <CopyBtn text={bundleId} />
        </>
      }
      rightElement={
        <Link to={`/package/${packageId}/bundle/${bundleId}`} state={{ ...state, dataToEdit: null }}>
          <Button text="Back to bundle" variant="text" />
        </Link>
      }
    >
      <EditBundleForm {...{ bundleId, packageId, initData: state.dataToEdit }} />
    </SectionLayout>
  )
}

export default BundleEditPage
