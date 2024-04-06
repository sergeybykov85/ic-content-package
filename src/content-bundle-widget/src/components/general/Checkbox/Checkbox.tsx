import type { ComponentPropsWithoutRef, FC } from 'react'
import clsx from 'clsx'
import styles from './Checkbox.module.scss'

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  label?: string
}

const Checkbox: FC<CheckboxProps> = ({ label, className, ...props }) => (
  <label className={clsx(styles.container, className)}>
    {label}
    <input type="checkbox" {...props} />
    <span className={styles.checkmark}></span>
  </label>
)

export default Checkbox
