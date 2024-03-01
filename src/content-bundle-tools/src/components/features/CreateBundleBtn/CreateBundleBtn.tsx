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
    if (principal) {
      service
        .checkPossibilityToCreateBundle(principal)
        .then(value => {
          setPossibleToCreate(value)
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [principal, service])

  return possibleToCreate ? (
    <Link to={'create-bundle'}>
      <Button text="Create new bundle" />
    </Link>
  ) : null
}

export default CreateBundleBtn
