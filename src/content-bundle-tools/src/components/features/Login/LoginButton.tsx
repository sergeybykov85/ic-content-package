import type { FC, MouseEventHandler } from 'react'
import { useCallback, useState } from 'react'
import Button from 'components/general/Button'
import Dialog from 'components/general/ModalDialog'
import { LoginForm } from 'components/features/Login'
import { useAuth } from 'context/AuthContext'

interface LoginButtonProps {
  className?: string
}

const LoginButton: FC<LoginButtonProps> = ({ className }) => {
  const { isAuthenticated, logout } = useAuth()
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
    <>
      <Button variant={!isAuthenticated ? 'contained' : 'text'} {...{ onClick, className }}>
        {!isAuthenticated ? 'Log in' : 'Log out'}
      </Button>
      <Dialog {...{ open: open && !isAuthenticated, onClose }}>
        <LoginForm />
      </Dialog>
    </>
  )
}

export default LoginButton
