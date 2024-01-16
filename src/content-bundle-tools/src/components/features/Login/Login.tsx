import type { FC, MouseEventHandler } from 'react'
import { useCallback, useState } from 'react'
import Button from 'components/general/Button'
import Dialog from 'components/general/ModalDialog'
import { LoginForm } from 'components/features/Login'
import { useAuth } from 'context/AuthContext'
import If from 'components/general/If'
import clsx from 'clsx'
import Principal from 'components/features/Login/Principal'
import styles from './Login.module.scss'

interface LoginButtonProps {
  className?: string
}

const Login: FC<LoginButtonProps> = ({ className }) => {
  const { isAuthenticated, logout, principal = '' } = useAuth()
  const [open, setOpen] = useState(false)
  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation() // Prevents firing clickAway in the ModalDialog
      isAuthenticated ? logout() : setOpen(true)
    },
    [isAuthenticated, logout],
  )

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <div className={clsx(styles.container, className)}>
      <If condition={isAuthenticated}>
        <Principal {...{ principal }} />
      </If>
      <Button variant={!isAuthenticated ? 'contained' : 'text'} {...{ onClick }}>
        {!isAuthenticated ? 'Log in' : 'Log out'}
      </Button>
      <Dialog {...{ open: open && !isAuthenticated, onClose }}>
        <LoginForm />
      </Dialog>
    </div>
  )
}

export default Login
