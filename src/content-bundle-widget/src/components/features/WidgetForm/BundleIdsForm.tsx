import styles from './WidgetForm.module.scss'
import { type FC, type FormEventHandler, useCallback, useEffect, useState } from 'react'
import { TextInput } from '~/components/general/Inputs'
import IconButton from '~/components/general/IconButton'
import Chip from '~/components/general/Chip'
import clsx from 'clsx'

interface BundleIdsFormProps {
  initIds?: string[]
  onChange: (ids: string[]) => void
}

const BundleIdsForm: FC<BundleIdsFormProps> = ({ onChange, initIds }) => {
  const [ids, setIds] = useState<string[]>(initIds || [])
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    onChange(ids)
  }, [ids, onChange])

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      event.stopPropagation()
      if (newValue && !ids.includes(newValue)) {
        setIds(prevState => [...prevState, newValue])
      }
      setNewValue('')
    },
    [newValue, ids],
  )

  const handleRemove = useCallback((value: string) => {
    setIds(prevState => prevState.filter(item => item !== value))
  }, [])

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className={styles['bundle-ids-inputs']}>
        <TextInput
          label="Bundle IDs (optional)"
          placeholder="Type and press enter"
          value={newValue}
          onChange={event => setNewValue(event.target.value)}
          className={clsx(styles.input, styles['input--short'])}
        />
        <IconButton iconName="plus.svg" iconAlt="plus" type="submit" />
      </div>
      <div className={styles['bundle-ids-list']}>
        {ids.map(item => (
          <Chip text={item} key={item} color="black" withCross onCrossClick={handleRemove} />
        ))}
      </div>
    </form>
  )
}

export default BundleIdsForm
