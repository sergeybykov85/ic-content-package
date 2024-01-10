import type { ComponentPropsWithoutRef, FC } from 'react'
import clsx from 'clsx'
import styles from './Button.module.scss'

type ButtonProps = ComponentPropsWithoutRef<'button'>

const Button: FC<ButtonProps> = ({ className, children, ...props }) => (
  <button className={clsx(styles.button, className)} {...props}>
    {children}
  </button>
)

export default Button
