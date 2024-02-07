import type { ComponentPropsWithoutRef, FC } from 'react'
import styles from './TextInput.module.scss'
import clsx from 'clsx'

type TextInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

const TextInput: FC<TextInputProps> = ({ className, ...props }) => (
  <input type="text" className={clsx(styles.input, className)} {...props} />
)

export default TextInput
