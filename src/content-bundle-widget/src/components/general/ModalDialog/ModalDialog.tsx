import type { FC, ReactNode } from 'react'
import { useEffect, useCallback } from 'react'
import { CSSTransition } from 'react-transition-group'
import useClickAway from '~/hooks/useClickAway'
import clsx from 'clsx'
import styles from './ModalDialog.module.scss'
import usePressEsc from '~/hooks/usePressEsc'
import useCssTransitionClassNames from '~/hooks/useCssTransitionClassNames'

interface ModalDialogProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
}

const ModalDialog: FC<ModalDialogProps> = ({ open, onClose, children, className }) => {
  const handleClose = useCallback(() => onClose && onClose(), [onClose])

  usePressEsc(handleClose)

  const clickAwayRef = useClickAway<HTMLDialogElement>(handleClose)

  const { currentTransitionClassName, cssTransitionClassNames, transitionRef } = useCssTransitionClassNames({
    enter: styles['bg-enter'],
    enterActive: styles['bg-enter-active'],
    enterDone: styles['bg-enter-done'],
    exit: styles['bg-exit'],
    exitActive: styles['bg-exit-active'],
  })

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
      classNames={cssTransitionClassNames}
      mountOnEnter
      unmountOnExit
    >
      <div className={clsx(styles.bg, currentTransitionClassName)} ref={transitionRef}>
        <dialog className={clsx(styles.dialog, className)} ref={clickAwayRef}>
          {children}
        </dialog>
      </div>
    </CSSTransition>
  )
}

export default ModalDialog
