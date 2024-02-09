import { type FC, useCallback, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Button from '~/components/general/Button'
import styles from './DeployPackageForm.module.scss'
import { useServices } from '~/context/ServicesContext'
import { type DeployPackageParams, PackageTypes } from '~/types/packagesTypes.ts'
import Select from '~/components/general/Select'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import { enqueueSnackbar } from 'notistack'

const packageTypes = Object.values(PackageTypes)

interface FormValues {
  name: string
  description: string
}

const DeployPackageForm: FC = () => {
  const { packageService } = useServices()
  const [type, setType] = useState<PackageTypes>(PackageTypes.Public)
  const [imageFile, setImageFile] = useState<File | undefined>()

  const onSelect = useCallback((type: PackageTypes) => setType(type), [])

  const imageOnLoaded = useCallback<OnLoaded>(({ file }) => {
    setImageFile(file)
  }, [])

  const onSubmit = useCallback(
    async (values: FormValues): Promise<void> => {
      try {
        const logo: DeployPackageParams['logo'] = imageFile
          ? {
              type: imageFile.type,
              value: await fileToUint8Array(imageFile),
            }
          : undefined
        console.log('Deploying...', values)
        const packageId = await packageService?.deployPackage(type, { ...values, logo })
        console.log('SUCCESS', packageId)
        enqueueSnackbar(`${type} package has been deployed `, { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(`Deploy failed`, { variant: 'error' })
        console.error(error)
      }
    },
    [imageFile, packageService, type],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2, 'Too Short!').max(100, 'Maximum length 100 characters').required('Required!'),
      description: Yup.string().min(2, 'Too Short!').max(100, 'Maximum length 300 characters').required('Required!'),
    }),
    onSubmit,
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <div className={styles.grid}>
        <div>
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
        </div>
        <ImageInput maxSize={2097152} onLoaded={imageOnLoaded} />
      </div>
      <Button type="submit" text="Deploy" />
    </form>
  )
}

export default DeployPackageForm
