import type { ComponentPropsWithoutRef, FC } from 'react'
import clsx from 'clsx'
import styles from './Button.module.scss'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'contained' | 'text' | 'outlined'
  color?: 'blue' | 'red'
  text?: string
}

const Button: FC<ButtonProps> = ({ className, variant = 'contained', color = 'blue', text, children, ...props }) => (
  <button className={clsx(styles.button, styles[variant], styles[color], className)} {...props}>
    {text || children}
  </button>
)

export default Button
