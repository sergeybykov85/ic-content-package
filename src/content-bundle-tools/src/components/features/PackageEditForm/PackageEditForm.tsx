import type PackageDetails from '~/models/PackageDetails.ts'
import { type FC, useCallback, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextArea, TextInput } from '~/components/general/Inputs'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import { useNavigate } from 'react-router-dom'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import type { DeployPackageMetadata, PackageTypes } from '~/types/packagesTypes.ts'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import styles from './PackageEditForm.module.scss'
import Select from '~/components/general/Select'
import Button from '~/components/general/Button'

interface PackageEditFormProps {
  packageId: string
  initValues: Pick<PackageDetails, 'name' | 'description' | 'logoUrl' | 'submission'>
}

type FormValues = Pick<PackageDetails, 'name' | 'description'>

const NAME_MAX_LENGTH = import.meta.env.VITE_BUNDLE_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_BUNDLE_DESCRIPTION_MAX_LENGTH

const PackageEditForm: FC<PackageEditFormProps> = ({ initValues, packageId }) => {
  const navigate = useNavigate()
  const { setLoading } = useFullScreenLoading()
  const { initBundlePackageService, packageRegistryService } = useServices()

  const [imageFile, setImageFile] = useState<File | undefined>()

  const bundlePackageService = useMemo(() => {
    return packageId && initBundlePackageService ? initBundlePackageService(packageId) : null
  }, [initBundlePackageService, packageId])

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true)

        const { name, description } = values

        const logo: DeployPackageMetadata['logo'] = imageFile
          ? { type: imageFile.type, value: await fileToUint8Array(imageFile) }
          : undefined

        await bundlePackageService?.updatePackageMetadata({ name, description, logo })
        await packageRegistryService?.refreshPackage(packageId)

        enqueueSnackbar(`Package has been edited `, { variant: 'success' })
        setLoading(false)
        navigate(`/package/${packageId}`)
      } catch (error) {
        enqueueSnackbar(`Failed`, { variant: 'error' })
        console.error(error)
        setLoading(false)
      }
    },
    [bundlePackageService, imageFile, navigate, packageId, packageRegistryService, setLoading],
  )

  const form = useFormik<FormValues>({
    initialValues: initValues,
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .min(2, 'Too Short!')
        .max(NAME_MAX_LENGTH, `Maximum length ${NAME_MAX_LENGTH} characters`)
        .required('Required!'),
      description: Yup.string()
        .min(2, 'Too Short!')
        .max(DESCRIPTION_MAX_LENGTH, `Maximum length ${DESCRIPTION_MAX_LENGTH} characters`)
        .required('Required!'),
    }),
    onSubmit,
  })

  const imageOnLoaded = useCallback<OnLoaded>(({ file }) => {
    setImageFile(file)
  }, [])

  return (
    <form onSubmit={form.handleSubmit}>
      <div className={styles.grid}>
        <div>
          <Select<PackageTypes> label="Type" defaultValue={initValues.submission} options={[]} disabled />
          <TextInput
            name="name"
            label="Name"
            placeholder="Set package name"
            value={form.values.name}
            onChange={form.handleChange}
            error={form.errors.name}
            className={styles.input}
          />
          <TextArea
            name="description"
            label="Description"
            placeholder="Set package description"
            value={form.values.description}
            onChange={form.handleChange}
            error={form.errors.description}
            className={styles.input}
            rows={3}
          />
        </div>
        <div>
          <ImageInput src={initValues.logoUrl} maxSize={2097152} onLoaded={imageOnLoaded} className={styles.img} />
        </div>
      </div>

      <Button type="submit" text="Update" className={styles.btn} />
    </form>
  )
}

export default PackageEditForm
