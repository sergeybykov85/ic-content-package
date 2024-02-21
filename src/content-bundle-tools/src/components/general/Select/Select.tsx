import { type ReactNode, useCallback, useState } from 'react'
import { TextInput } from '~/components/general/Inputs'
import useClickAway from '~/hooks/useClickAway.ts'
import styles from './Select.module.scss'
import clsx from 'clsx'

interface SelectProps<T> {
  defaultValue: T
  options: T[]
  onSelect?: (value: T) => void
  className?: string
  label?: string
}

function Select<T extends string = string>({
  options,
  onSelect,
  defaultValue,
  className,
  label,
}: SelectProps<T>): ReactNode {
  const [value, setValue] = useState(defaultValue)
  const [visible, setVisible] = useState(false)

  const onFocus = useCallback(() => setVisible(true), [])
  const hideOptions = useCallback(() => setVisible(false), [])

  const ref = useClickAway<HTMLDivElement>(hideOptions)

  const onClick = useCallback(
    (newValue: T) => {
      hideOptions()
      setValue(newValue)
      onSelect && onSelect(newValue)
    },
    [hideOptions, onSelect],
  )

  return (
    <div ref={ref} className={clsx(styles.select, className, visible && styles.opened)}>
      <label>
        <span className={clsx(styles.label, !label && styles['no-label'])}>{label}</span>
        <TextInput readOnly {...{ value, onFocus }} className={styles.input} />
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
