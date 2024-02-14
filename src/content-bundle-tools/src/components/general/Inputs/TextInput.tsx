import type { ComponentPropsWithoutRef, FC } from 'react'
import styles from '~/components/general/Inputs/Inputs.module.scss'
import clsx from 'clsx'
import InputWrapper, { type InputWrapperProps } from './InputWrapper.tsx'

type TextInputProps = InputWrapperProps &
  Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
    type?: 'text' | 'number'
  }

const TextInput: FC<TextInputProps> = ({ className, label, error, type = 'text', ...props }) => (
  <InputWrapper {...{ className, label, error }}>
    <input type={type} className={clsx(styles.input)} {...props} />
  </InputWrapper>
)

export default TextInput
