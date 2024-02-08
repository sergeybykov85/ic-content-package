import InputWrapper, { type InputWrapperProps } from './InputWrapper.tsx'
import type { ComponentPropsWithoutRef, FC } from 'react'
import clsx from 'clsx'
import styles from '~/components/general/Inputs/Inputs.module.scss'

type TextAreaProps = InputWrapperProps & ComponentPropsWithoutRef<'textarea'>
const TextArea: FC<TextAreaProps> = ({ className, label, error, ...props }) => (
  <InputWrapper {...{ className, label, error }}>
    <textarea className={clsx(styles.input, styles.textarea)} {...props} />
  </InputWrapper>
)

export default TextArea
