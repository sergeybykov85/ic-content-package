import type { ChangeEventHandler, FC, FormEventHandler } from 'react'
import { useCallback, useState } from 'react'
import { TextInput } from '~/components/general/Inputs'
import styles from './BundleForms.module.scss'
import Chip from '~/components/general/Chip'
import clsx from 'clsx'
import IconButton from '~/components/general/IconButton'

interface TagsFormProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

const TagsForm: FC<TagsFormProps> = ({ tags, onChange }) => {
  const [tagValue, setTagValue] = useState('')

  const handleTagChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    setTagValue(event.target.value)
  }, [])

  const handleDeleteTag = useCallback(
    (value: string) => {
      onChange(tags.filter(item => item !== value))
    },
    [onChange, tags],
  )

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      if (tagValue && !tags.includes(tagValue.toLowerCase())) {
        onChange([...tags, tagValue.toLowerCase()])
        setTagValue('')
        document.getElementById('tag-input')?.focus()
      }
    },
    [onChange, tagValue, tags],
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles['tag-input-wrapper']}>
        <TextInput
          id="tag-input"
          label="Tags"
          placeholder="Type and press enter"
          value={tagValue}
          onChange={handleTagChange}
          className={clsx(styles.input, styles['input--short'])}
          pattern="[a-zA-Z_]+"
          title="Only letters and underscore"
        />
        <IconButton
          iconName="plus.svg"
          iconAlt="plus"
          type="submit"
          className={clsx(tagValue && styles['show-plus'])}
        />
      </div>
      <div className={styles.tags}>
        {tags.map(tag => (
          <Chip key={tag} text={tag} color="blue" withCross onCrossClick={handleDeleteTag} />
        ))}
      </div>
    </form>
  )
}

export default TagsForm
