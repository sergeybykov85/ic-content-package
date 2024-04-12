import { type FC, useCallback, useState } from 'react'
import type { AdditionalDataRawParams } from '~/types/bundleDataTypes.ts'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FileInput, { type FileInputProps } from '~/components/general/FileInput'
import styles from './AudioDataForm.module.scss'
import locales from '~/utils/locales.ts'
import Select from '~/components/general/Select'

interface AudioDataFormProps {
  formId: string
  onSubmit: (params: { rawParams: Pick<AdditionalDataRawParams, 'payload' | 'locale'> }) => void
}

interface FormValues {
  locale: string
}

const AudioDataForm: FC<AudioDataFormProps> = ({ formId, onSubmit }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const handleSubmit = useCallback(
    async ({ locale }: FormValues) => {
      if (audioFile) {
        onSubmit({
          rawParams: {
            locale: locales.getCodeByLanguage(locale),
            payload: audioFile,
          },
        })
      }
    },
    [audioFile, onSubmit],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      locale: locales.getLanguageByCode('en'),
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('Required!')
        .matches(/^[a-zA-Z0-9_. -]+$/g, { message: 'Only latin characters, numbers, spaces and ".", "_", "-"' }),
    }),
    onSubmit: handleSubmit,
  })

  const onLoadFile = useCallback<FileInputProps['onLoaded']>(
    ({ file: newFile }) => {
      setAudioFile(newFile)
      if (!form.values.locale) {
        form.setFieldValue('name', newFile?.name || '')
      }
    },
    [form],
  )

  const handleLocaleSelect = useCallback((value: string) => form.setFieldValue('locale', value), [form])

  return (
    <form onSubmit={form.handleSubmit} id={formId}>
      <Select
        label="Locale"
        placeholder="Chose locale"
        defaultValue={form.initialValues.locale}
        options={locales.getAllLanguages()}
        onSelect={handleLocaleSelect}
        error={form.errors.locale}
        className={styles.select}
      />
      <FileInput onLoaded={onLoadFile} className={styles.file} accept="audio/*">
        {audioFile ? <p>{audioFile.name}</p> : <span>Choose a file</span>}
      </FileInput>
    </form>
  )
}

export default AudioDataForm
