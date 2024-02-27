import { type ReactNode, useCallback, useState } from 'react'
import { TextInput } from '~/components/general/Inputs'
import useClickAway from '~/hooks/useClickAway.ts'
import styles from './Select.module.scss'
import clsx from 'clsx'
import If from '~/components/general/If'

interface SelectProps<T> {
  defaultValue: T
  options: T[]
  onSelect?: (value: T) => void
  className?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

function Select<T extends string = string>({
  options,
  onSelect,
  defaultValue,
  className,
  label,
  placeholder,
  error,
  disabled,
}: SelectProps<T>): ReactNode {
  const [value, setValue] = useState(defaultValue)
  const [visible, setVisible] = useState(false)

  const onFocus = useCallback(() => !disabled && setVisible(true), [disabled])
  const hideOptions = useCallback(() => setVisible(false), [])

  const ref = useClickAway<HTMLDivElement>(hideOptions)

  const onClick = useCallback(
    (newValue: T) => {
      if (!disabled) {
        hideOptions()
        setValue(newValue)
        onSelect && onSelect(newValue)
      }
    },
    [hideOptions, onSelect, disabled],
  )

  return (
    <div ref={ref} className={clsx(styles.select, className, visible && styles.opened)}>
      <label>
        <span className={clsx(styles.label, !label && styles['no-label'])}>{label}</span>
        <TextInput readOnly {...{ value, placeholder, onFocus, disabled }} className={styles.input} />
        <If condition={Boolean(error)}>
          <div className={styles.error}>{error}</div>
        </If>
      </label>
      <ul className={clsx(styles.options)}>
        {options.map(item => (
          <li key={item} value={item} onClick={() => onClick(item)}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Select
