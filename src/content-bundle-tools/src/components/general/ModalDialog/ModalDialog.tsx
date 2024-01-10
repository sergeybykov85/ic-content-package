import type { FC, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import useClickAway from 'hooks/useClickAway'
import type { CSSTransitionClassNames } from 'react-transition-group/CSSTransition'
import clsx from 'clsx'
import styles from 'components/general/ModalDialog/ModalDialog.module.scss'

interface ModalDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

const TRANSITION_CLASS_NAMES: CSSTransitionClassNames = {
  enter: styles['bg-enter'],
  enterActive: styles['bg-enter-active'],
  enterDone: styles['bg-enter-done'],
  exit: styles['bg-exit'],
  exitActive: styles['bg-exit-active'],
}

const ModalDialog: FC<ModalDialogProps> = ({ open, onClose, children }) => {
  const clickAwayRef = useClickAway<HTMLDialogElement>(onClose)
  const transitionRef = useRef<HTMLDivElement>(null)
  const currentTransitionClassName = transitionRef.current?.className.match(
    Object.values(TRANSITION_CLASS_NAMES).join('|'),
  )?.[0]

  useEffect(() => {
    const onPressEsc = (event: KeyboardEvent): void => {
      event.key === 'Escape' && onClose()
    }
    document.addEventListener('keyup', onPressEsc)
    return () => {
      document.removeEventListener('keyup', onPressEsc)
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.body.classList.add('disable-scroll')
    } else {
      document.body.classList.contains('disable-scroll') && document.body.classList.remove('disable-scroll')
    }
  }, [open])

  return (
    <CSSTransition
      in={open}
      nodeRef={transitionRef}
      timeout={300}
      classNames={TRANSITION_CLASS_NAMES}
      mountOnEnter
      unmountOnExit
    >
      <div className={clsx(styles.bg, currentTransitionClassName)} ref={transitionRef}>
        <dialog ref={clickAwayRef}>{children}</dialog>
      </div>
    </CSSTransition>
  )
}

export default ModalDialog
