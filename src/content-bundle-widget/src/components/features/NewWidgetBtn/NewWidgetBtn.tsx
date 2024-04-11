import { type FC, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import { useAuth } from '~/context/AuthContext'
import { Link } from 'react-router-dom'
import Button from '~/components/general/Button'

type Allowance = 'allowed' | 'not-allowed' | 'limit-reached' | 'unknown'

const NewWidgetBtn: FC = () => {
  const { principal } = useAuth()
  const { widgetService } = useServices()
  const [allowance, setAllowance] = useState<Allowance>('unknown')

  useEffect(() => {
    if (principal) {
      widgetService.getActivityBy(principal).then(res => {
        if (res.allowance === 0) {
          setAllowance('not-allowed')
        } else if (res.allowance > res.widgetsAmount) {
          setAllowance('allowed')
        } else if (res.allowance === res.widgetsAmount) {
          setAllowance('limit-reached')
        }
      })
    }
  }, [principal, widgetService])

  const tooltip = useMemo(() => {
    switch (allowance) {
      case 'not-allowed':
        // prettier-ignore
        return 'You\'re not allowed to create widgets'
      case 'limit-reached':
        return 'You have reached the limit'
    }
  }, [allowance])

  return allowance ? (
    <Link to="/new-widget">
      <Button text="Create new widget" disabled={allowance !== 'allowed'} title={tooltip} />
    </Link>
  ) : null
}

export default NewWidgetBtn
