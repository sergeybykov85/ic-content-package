import type { ComponentPropsWithoutRef, FC } from 'react'
import clsx from 'clsx'
import styles from './Button.module.scss'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'contained' | 'text'
}

const Button: FC<ButtonProps> = ({ className, variant = 'contained', children, ...props }) => (
  <button className={clsx(styles.button, styles[variant], className)} {...props}>
    {children}
  </button>
)

export default Button
