import type { FC, MouseEventHandler } from 'react'
import { useEffect } from 'react'
import { useCallback } from 'react'
import Button from 'components/general/Button'
import { useAuth } from 'context/AuthContext'

interface LogInButtonProps {
  className?: string
}

const LogInButton: FC<LogInButtonProps> = ({ className }) => {
  const { isAuthenticated, login } = useAuth()
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async e => {
      e.preventDefault()
      login()
    },
    [login],
  )

  useEffect(() => {
    console.log('isAuthenticated ===>', isAuthenticated)
  }, [isAuthenticated])

  return (
    <Button {...{ onClick, className }}>
      Log in with <img src="/images/icp-logo.svg" alt="ICP logo" />
    </Button>
  )
}

export default LogInButton
