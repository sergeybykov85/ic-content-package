import { type FC, useCallback, useState } from 'react'
import type { AdditionalDataRawParams } from '~/types/bundleDataTypes.ts'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextInput } from '~/components/general/Inputs'
import FileInput, { type FileInputProps } from '~/components/general/FileInput'
import styles from './RawDataForm.module.scss'
import { enqueueSnackbar } from 'notistack'
import bytesToMb from '~/utils/bytesToMb.ts'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'

const FILE_MAX_SIZE = import.meta.env.VITE_FILE_MAX_SIZE

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
      if (!file) {
        enqueueSnackbar(`Upload a file, please`, { variant: 'warning' })
        return
      }
      if (file.size > FILE_MAX_SIZE) {
        enqueueSnackbar(`Max file size is ${bytesToMb(FILE_MAX_SIZE)}`, { variant: 'warning' })
        return
      }
      onSubmit({
        rawParams: {
          name,
          payload: {
            contentType: file.type,
            value: await fileToUint8Array(file),
          },
        },
      })
    },
    [file, onSubmit],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Required!'),
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
        {file ? file.name : <span>Choose a file up to 2 mb</span>}
      </FileInput>
    </form>
  )
}

export default RawDataForm
