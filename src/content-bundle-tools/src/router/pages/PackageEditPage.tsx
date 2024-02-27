import type { FC } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import CopyBtn from '~/components/general/CopyBtn'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import Button from '~/components/general/Button'
import PackageEditForm from '~/components/features/PackageEditForm'

const PackageEditPage: FC = () => {
  const { packageId } = useParams()
  const { state } = useLocation()

  if (!state.dataToEdit || !packageId) {
    return <Navigate to={`/package/${packageId}`} state={state} />
  }

  return (
    <SectionLayout
      title={
        <>
          Package ID: {packageId} <CopyBtn text={packageId} />
        </>
      }
      rightElement={
        <Link to={`/package/${packageId}`} state={{ ...state, dataToEdit: null }}>
          <Button text="Back to package" variant="text" />
        </Link>
      }
    >
      <PackageEditForm packageId={packageId} initValues={state.dataToEdit} />
    </SectionLayout>
  )
}

export default PackageEditPage
