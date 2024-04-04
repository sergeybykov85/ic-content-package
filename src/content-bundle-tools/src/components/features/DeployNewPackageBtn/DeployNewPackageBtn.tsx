import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'

type Allowance = 'allowed' | 'not-allowed' | 'limit-reached' | 'unknown'

const DeployNewPackageBtn: FC = () => {
  const { principal } = useAuth()
  const { packageService } = useServices()
  const [allowance, setAllowance] = useState<Allowance>('unknown')

  useEffect(() => {
    if (principal && packageService) {
      packageService?.getActivityBy(principal).then(res => {
        if (res.allowance === 0) {
          setAllowance('not-allowed')
        } else if (res.allowance > res.deployedPackagesNumber) {
          setAllowance('allowed')
        } else if (res.allowance === res.deployedPackagesNumber) {
          setAllowance('limit-reached')
        }
      })
    }
  }, [principal, packageService])

  const tooltip = useMemo(() => {
    switch (allowance) {
      case 'not-allowed':
        return 'You\'re not allowed to deploy packages'
      case 'limit-reached':
        return 'You have reached the limit'
    }
  }, [allowance])

  return allowance ? (
    <Link to="/deploy-package">
      <Button text="Deploy new package" disabled={allowance !== 'allowed'} title={tooltip} />
    </Link>
  ) : null
}

export default DeployNewPackageBtn
