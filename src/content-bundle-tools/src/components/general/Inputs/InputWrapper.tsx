import type { ReactNode, FC } from 'react'
import { Children, cloneElement, isValidElement, useId } from 'react'
import clsx from 'clsx'
import styles from '~/components/general/Inputs/Inputs.module.scss'
import If from '~/components/general/If'

export interface InputWrapperProps {
  label?: string
  error?: string
  className?: string
  id?: string
}

interface Props extends InputWrapperProps {
  children: ReactNode
}

const InputWrapper: FC<Props> = ({ children, label, error, className, id }) => {
  const generatedId = useId()
  return (
    <div className={clsx(styles.wrapper, className)}>
      <If condition={Boolean(label)}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </If>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      {Children.map(children, child => isValidElement(child) && cloneElement(child, { id: id || generatedId }))}
      <If condition={Boolean(error)}>
        <div className={styles.error}>{error}</div>
      </If>
    </div>
  )
}

export default InputWrapper
