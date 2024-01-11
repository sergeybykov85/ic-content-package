import type { FC, MouseEventHandler } from 'react'
import { useCallback, useState } from 'react'
import Button from 'components/general/Button'
import { useAuth } from 'context/AuthContext'
import Dialog from 'components/general/ModalDialog'

interface LogInButtonProps {
  className?: string
}

const LogInButton: FC<LogInButtonProps> = ({ className }) => {
  // const { isAuthenticated, login } = useAuth()
  // const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
  //   async e => {
  //     e.preventDefault()
  //     login()
  //   },
  //   [login],
  // )
  //
  // useEffect(() => {
  //   console.log('isAuthenticated ===>', isAuthenticated)
  // }, [isAuthenticated])

  const [open, setOpen] = useState(false)

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(e => {
    e.stopPropagation() // Prevents firing clickAway in the ModalDialog
    setOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <Button {...{ onClick, className }}>
        Log in with <img src="/images/icp-logo.svg" alt="ICP logo" />
      </Button>
      <Dialog {...{ open, onClose }}>Dialog</Dialog>
    </>
  )
}

export default LogInButton
