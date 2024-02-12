import { type FC, useCallback } from 'react'
import SectionLayout from '~/components/layouts/SectionLayout'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Loader from '~/components/general/Loader'
import If from '~/components/general/If'
import Button from '~/components/general/Button'

const PackageDetailsPage: FC = () => {
  const { packageId } = useParams()
  const { key } = useLocation()
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  return (
    <SectionLayout
      title={`Package ID ${packageId}`}
      rightElement={
        <If condition={key !== 'default'}>
          <Button variant="text" onClick={goBack}>
            Back to the list
          </Button>
        </If>
      }
    >
      <Loader />
    </SectionLayout>
  )
}

export default PackageDetailsPage
