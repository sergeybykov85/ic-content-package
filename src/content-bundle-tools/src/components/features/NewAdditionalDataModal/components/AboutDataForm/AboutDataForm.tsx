import { type FC, useCallback } from 'react'
import type { AboutDataParams, ApplyAdditionalDataParams } from '~/types/bundleDataTypes.ts'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import locales from '~/../public/libs/locales.json'
import Select from '~/components/general/Select'
import { TextArea, TextInput } from '~/components/general/Inputs'
import styles from './AboutDataForm.module.scss'

const LOCALES = locales as Record<string, string>

interface AboutDataFormProps {
  formId: string
  onSubmit: (params: Pick<ApplyAdditionalDataParams, 'payload' | 'locale'>) => void
}

type FormValues = Omit<AboutDataParams, 'attributes'>

const AboutDataForm: FC<AboutDataFormProps> = ({ formId, onSubmit }) => {
  const handleSubmit = useCallback(
    (values: FormValues) => {
      onSubmit({
        locale: values.locale,
        payload: {
          about: values,
        },
      })
    },
    [onSubmit],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      locale: LOCALES['en'],
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2, 'Too Short!').max(100, `Maximum length ${100} characters`).required('Required!'),
      description: Yup.string().min(2, 'Too Short!').max(300, `Maximum length ${300} characters`).required('Required!'),
      locale: Yup.string().required('Required!'),
    }),
    onSubmit: handleSubmit,
  })

  const handleLocaleSelect = useCallback((value: string) => form.setFieldValue('locale', value), [form])

  return (
    <form onSubmit={form.handleSubmit} id={formId} className={styles.form}>
      <Select
        label="Locale"
        placeholder="Chose locale"
        defaultValue={form.initialValues.locale}
        options={Object.values(LOCALES)}
        onSelect={handleLocaleSelect}
        error={form.errors.locale}
        className={styles.select}
      />
      <TextInput
        name="name"
        label="Title"
        placeholder="Set title"
        value={form.values.name}
        onChange={form.handleChange}
        error={form.errors.name}
      />
      <TextArea
        name="description"
        label="Description"
        placeholder="Set description"
        value={form.values.description}
        onChange={form.handleChange}
        error={form.errors.description}
        rows={3}
      />
    </form>
  )
}

export default AboutDataForm
