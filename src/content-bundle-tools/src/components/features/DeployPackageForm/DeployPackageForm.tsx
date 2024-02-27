import { type ChangeEventHandler, type FC, useCallback, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Button from '~/components/general/Button'
import styles from './DeployPackageForm.module.scss'
import { useServices } from '~/context/ServicesContext'
import { IdentifierTypes, PackageTypes } from '~/types/packagesTypes.ts'
import type { DeployPackageMetadata } from '~/types/packagesTypes.ts'
import Select from '~/components/general/Select'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import Collapse from '~/components/general/Collapse'
import Checkbox from '~/components/general/Checkbox'

const packageTypes = Object.values(PackageTypes)
const identifierTypes = Object.values(IdentifierTypes)

const NAME_MAX_LENGTH = import.meta.env.VITE_BUNDLE_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_BUNDLE_DESCRIPTION_MAX_LENGTH

interface FormValues {
  name: string
  description: string
  maxTagSupply?: number
  maxCreatorSupply?: number
  maxSupply?: number
}

const DeployPackageForm: FC = () => {
  const { packageService } = useServices()
  const navigate = useNavigate()
  const { setLoading } = useFullScreenLoading()
  const [type, setType] = useState<PackageTypes>(PackageTypes.Public)
  const [identifierType, setIdentifierType] = useState<IdentifierTypes>(IdentifierTypes.Hash)
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [withOptions, setWithOptions] = useState(false)

  const onSelectType = useCallback((type: PackageTypes) => setType(type), [])
  const onSelectIdType = useCallback((type: IdentifierTypes) => setIdentifierType(type), [])
  const toggleWithOptions = useCallback<ChangeEventHandler<HTMLInputElement>>(e => setWithOptions(e.target.checked), [])

  const imageOnLoaded = useCallback<OnLoaded>(({ file }) => {
    setImageFile(file)
  }, [])

  const onSubmit = useCallback(
    async (values: FormValues): Promise<void> => {
      try {
        setLoading(true)

        const logo: DeployPackageMetadata['logo'] = imageFile
          ? { type: imageFile.type, value: await fileToUint8Array(imageFile) }
          : undefined
        const { name, description, ...options } = values

        const packageId = await packageService?.deployPackage(
          type,
          { name, description, logo },
          withOptions ? { ...options, identifierType } : undefined,
        )

        enqueueSnackbar(`${type} package has been deployed `, { variant: 'success' })
        setLoading(false)
        navigate(`/package/${packageId}`)
      } catch (error) {
        enqueueSnackbar(`Deploy failed`, { variant: 'error' })
        console.error(error)
        setLoading(false)
      }
    },
    [imageFile, navigate, packageService, setLoading, type, identifierType, withOptions],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      maxSupply: 0,
      maxCreatorSupply: 0,
      maxTagSupply: 0,
    },
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
      maxCreatorSupply: Yup.number(),
      maxSupply: Yup.number(),
      maxTagSupply: Yup.number(),
    }),
    onSubmit,
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <div className={styles.grid}>
        <div>
          <Select<PackageTypes> label="Chose type" defaultValue={type} options={packageTypes} onSelect={onSelectType} />
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
          <Checkbox label="With options" className={styles.checkbox} onChange={toggleWithOptions} />
          <Collapse open={withOptions} className={styles.collapse}>
            <div className={styles.options}>
              <TextInput
                name="maxSupply"
                label="Max supply"
                placeholder="Infinit"
                value={form.values.maxSupply || ''}
                onChange={form.handleChange}
                error={form.errors.maxSupply}
                type="number"
              />
              <TextInput
                name="maxCreatorSupply"
                label="Max bundles for creator"
                placeholder="Infinit"
                value={form.values.maxCreatorSupply || ''}
                onChange={form.handleChange}
                error={form.errors.maxCreatorSupply}
                type="number"
              />
              <TextInput
                name="maxTagSupply"
                label="Max tags for a bundle"
                placeholder="Default"
                value={form.values.maxTagSupply || ''}
                onChange={form.handleChange}
                error={form.errors.maxTagSupply}
                type="number"
              />
              <Select<IdentifierTypes>
                label="Chose ID type"
                defaultValue={identifierType}
                options={identifierTypes}
                onSelect={onSelectIdType}
              />
            </div>
          </Collapse>
        </div>
        <div>
          <ImageInput maxSize={2097152} onLoaded={imageOnLoaded} className={styles.img} />
        </div>
      </div>
      <Button type="submit" text="Deploy" className={styles.btn} />
    </form>
  )
}

export default DeployPackageForm
