import { type ReactNode, useCallback, useState } from 'react'
import TextInput from '~/components/general/TextInput'
import useClickAway from '~/hooks/useClickAway.ts'
import styles from './Select.module.scss'
import clsx from 'clsx'

interface SelectProps<T> {
  defaultValue: T
  options: T[]
  onSelect?: (value: T) => void
}

function Select<T extends string = string>({ options, onSelect, defaultValue }: SelectProps<T>): ReactNode {
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
    [hideOptions],
  )

  return (
    <div ref={ref} className={clsx(styles.select, visible && styles.opened)}>
      <TextInput readOnly {...{ value, onFocus }} className={styles.input} />
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
