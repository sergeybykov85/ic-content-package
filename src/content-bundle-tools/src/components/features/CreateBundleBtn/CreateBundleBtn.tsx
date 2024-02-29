import type BundlePackageService from '~/services/BundlePackageService.ts'
import { type FC, useEffect, useState } from 'react'
import Button from '~/components/general/Button'
import { useAuth } from '~/context/AuthContext'
import { Link } from 'react-router-dom'

interface CreateBundleBtnProps {
  service: BundlePackageService
}

const CreateBundleBtn: FC<CreateBundleBtnProps> = ({ service }) => {
  const { principal } = useAuth()

  const [possibleToCreate, setPossibleToCreate] = useState(false)

  useEffect(() => {
    service.getPackageDetails().then(data => {
      setPossibleToCreate(
        data.owner === principal && (data.maxSupply === 'unlimited' || data.totalBundles < data.maxSupply),
      )
    })
  }, [principal, service])

  return possibleToCreate ? (
    <Link to={'create-bundle'}>
      <Button text="Create new bundle" />
    </Link>
  ) : null
}

export default CreateBundleBtn
// TODO: Possibility to contribute
