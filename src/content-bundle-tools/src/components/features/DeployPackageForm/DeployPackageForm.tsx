import { type FC, useCallback, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Button from '~/components/general/Button'
import styles from './DeployPackageForm.module.scss'
import { useServices } from '~/context/ServicesContext'
import { PackageTypes } from '~/types/packagesTypes.ts'
import Select from '~/components/general/Select'

const packageTypes = Object.values(PackageTypes)

const DeployPackageForm: FC = () => {
  const { packageService } = useServices()
  const [type, setType] = useState<PackageTypes>(PackageTypes.Public)

  const onSelect = useCallback((type: PackageTypes) => setType(type), [])

  const form = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2, 'Too Short!').max(100, 'Maximum length 100 characters').required('Required!'),
      description: Yup.string().min(2, 'Too Short!').max(100, 'Maximum length 300 characters').required('Required!'),
    }),
    onSubmit: values => {
      console.log('Deploying...', values)
      packageService
        ?.deployPackage(type, { ...values })
        .then(response => {
          console.log('SUCCESS', response)
        })
        .catch(error => {
          console.log('ERROR', error)
        })
    },
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <Select<PackageTypes> label="Chose type" defaultValue={type} options={packageTypes} onSelect={onSelect} />
      <TextInput
        name="name"
        label="Name"
        value={form.values.name}
        onChange={form.handleChange}
        error={form.errors.name}
        className={styles.input}
      />
      <TextArea
        name="description"
        label="Description"
        value={form.values.description}
        onChange={form.handleChange}
        error={form.errors.description}
        className={styles.input}
        rows={3}
      />
      <Button type="submit" text="Deploy" />
    </form>
  )
}

export default DeployPackageForm
