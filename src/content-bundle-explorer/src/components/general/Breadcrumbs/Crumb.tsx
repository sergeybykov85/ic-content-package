import { useCallback, useEffect, useState } from 'react'
import type { ChangeEventHandler, FC, FormEventHandler } from 'react'
import If from '~/components/general/If'
import Button from '~/components/general/Button'
import styles from './Breadcrumbs.module.scss'
import { TextInput } from '~/components/general/Inputs'
import IconButton from '~/components/general/IconButton'
import clsx from 'clsx'
import usePressEsc from '~/hooks/usePressEsc.ts'

type Type = 'package' | 'bundle'
export type CrumbSubmitEvent = (type: Type, value: string) => void

interface CrumbProps {
  value: string
  type: Type
  onSubmit: CrumbSubmitEvent
}

const Crumb: FC<CrumbProps> = ({ value, type, onSubmit }) => {
  const [editMode, setEditMode] = useState(false)
  const [newValue, setNewValue] = useState(value)

  useEffect(() => {
    setNewValue(value)
  }, [value])

  usePressEsc(() => {
    editMode && toggleEditMode()
  })

  const toggleEditMode = useCallback(() => {
    if (editMode) {
      setEditMode(false)
      setNewValue(value)
    } else {
      setEditMode(true)
    }
  }, [editMode, value])

  const handleValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    setNewValue(event.target.value)
  }, [])

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      setEditMode(false)
      if (newValue) {
        onSubmit(type, newValue)
      }
    },
    [newValue, onSubmit, type],
  )

  return (
    <div className={styles.flex}>
      <If condition={!editMode}>
        {value ? (
          <div className={styles.flex}>
            <span onClick={toggleEditMode} className={clsx(styles.value, styles.grey)}>
              {value}
            </span>
          </div>
        ) : (
          <Button text={`+ Add ${type} id`} variant="text" onClick={toggleEditMode} className={styles['add-btn']} />
        )}
      </If>
      <If condition={editMode}>
        <form className={clsx(styles.flex, styles.form)} onSubmit={handleSubmit}>
          <TextInput value={newValue} onChange={handleValueChange} />
          <IconButton type="submit" iconName="check-mark.svg" size={32} />
          <IconButton iconName="cross.svg" size={32} onClick={toggleEditMode} />
        </form>
      </If>
    </div>
  )
}

export default Crumb
