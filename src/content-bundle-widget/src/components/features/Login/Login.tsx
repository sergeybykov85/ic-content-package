import { type FC, type MouseEventHandler, useMemo } from 'react'
import { useCallback, useState } from 'react'
import Button from '~/components/general/Button'
import Dialog from '~/components/general/ModalDialog'
import { LoginForm } from '~/components/features/Login'
import { useAuth } from '~/context/AuthContext'
import If from '~/components/general/If'
import clsx from 'clsx'
import PrincipalBtn from '~/components/features/Login/PrincipalBtn.tsx'
import styles from './Login.module.scss'

interface LoginButtonProps {
  className?: string
  text?: string
}

const Login: FC<LoginButtonProps> = ({ className, text }) => {
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

  const btnText = useMemo(() => (!isAuthenticated ? text || 'Log in' : 'Log out'), [isAuthenticated, text])

  return (
    <div className={clsx(styles.container, className)}>
      <If condition={isAuthenticated && Boolean(principal)}>
        <PrincipalBtn {...{ principal }} />
      </If>
      <Button variant={!isAuthenticated ? 'contained' : 'text'} {...{ onClick }} text={btnText} />
      <Dialog {...{ open: open && !isAuthenticated, onClose }}>
        <LoginForm />
      </Dialog>
    </div>
  )
}

export default Login
