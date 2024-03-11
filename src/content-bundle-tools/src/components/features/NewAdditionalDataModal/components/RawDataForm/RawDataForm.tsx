import { type FC, useCallback, useState } from 'react'
import type { AdditionalDataRawParams } from '~/types/bundleDataTypes.ts'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextInput } from '~/components/general/Inputs'
import FileInput, { type FileInputProps } from '~/components/general/FileInput'
import styles from './RawDataForm.module.scss'

interface RawDataFormProps {
  formId: string
  onSubmit: (params: { rawParams: Pick<AdditionalDataRawParams, 'payload' | 'name'> }) => void
}

interface FormValues {
  name: string
}

const RawDataForm: FC<RawDataFormProps> = ({ formId, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = useCallback(
    async ({ name }: FormValues) => {
      if (file) {
        onSubmit({
          rawParams: {
            name,
            payload: file,
          },
        })
      }
    },
    [file, onSubmit],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
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
      setFile(newFile)
      if (!form.values.name) {
        form.setFieldValue('name', newFile?.name || '')
      }
    },
    [form],
  )

  return (
    <form onSubmit={form.handleSubmit} id={formId}>
      <TextInput
        name="name"
        label="File name"
        placeholder="Set file name"
        value={form.values.name}
        onChange={form.handleChange}
        error={form.errors.name}
        className={styles.input}
      />
      <FileInput onLoaded={onLoadFile} className={styles.file}>
        {file ? <p>{file.name}</p> : <span>Choose a file</span>}
      </FileInput>
    </form>
  )
}

export default RawDataForm
