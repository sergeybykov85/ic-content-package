import { type FC, useEffect, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'

const DeployNewPackageBtn: FC = () => {
  const { principal } = useAuth()
  const { packageService } = useServices()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (principal && packageService) {
      packageService?.checkPackageDeployAllowance(principal).then(res => setAllowed(res))
    }
  }, [principal, packageService])

  return allowed ? (
    <Link to="/deploy-package">
      <Button text="Deploy new package" />
    </Link>
  ) : null
}

export default DeployNewPackageBtn
