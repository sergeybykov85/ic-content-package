import styles from './ContributorsForm.module.scss'
import { type ChangeEventHandler, type FC, type FormEventHandler, useCallback, useState } from 'react'
import { TextInput } from '~/components/general/Inputs'
import clsx from 'clsx'
import IconButton from '~/components/general/IconButton'
import Chip from '~/components/general/Chip'

interface ContributorsFormProps {
  contributors: string[]
  onChange: (contributors: string[]) => void
}

const ContributorsForm: FC<ContributorsFormProps> = ({ contributors, onChange }) => {
  const [newContributor, setNewContributor] = useState('')

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    setNewContributor(event.target.value)
  }, [])

  const handleDelete = useCallback(
    (value: string) => {
      onChange(contributors.filter(item => item !== value))
    },
    [onChange, contributors],
  )

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      if (newContributor && !contributors.includes(newContributor)) {
        onChange([...contributors, newContributor])
        setNewContributor('')
        document.getElementById('tag-input')?.focus()
      }
    },
    [onChange, contributors, newContributor],
  )

  return (
    <div>
      <form className={styles['input-wrapper']} onSubmit={handleSubmit}>
        <TextInput
          label="Contributors"
          placeholder="Type and press enter"
          value={newContributor}
          onChange={handleInputChange}
          className={clsx(styles.input, styles['input--short'])}
        />
        <IconButton
          iconName="plus.svg"
          iconAlt="plus"
          type="submit"
        />
      </form>
      <div className={styles.list}>
        {contributors.map(item => (
          <Chip key={item} text={item} color="black" withCross onCrossClick={handleDelete} />
        ))}
      </div>
    </div>
  )
}

export default ContributorsForm
