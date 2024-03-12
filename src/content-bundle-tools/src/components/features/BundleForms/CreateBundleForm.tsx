import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import type { DeployPackageMetadata } from '~/types/packagesTypes.ts'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import { TextArea, TextInput } from '~/components/general/Inputs'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import Button from '~/components/general/Button'
import Select from '~/components/general/Select'
import clsx from 'clsx'
import styles from './BundleForms.module.scss'
import TagsForm from '~/components/features/BundleForms/TagsForm.tsx'

const NAME_MAX_LENGTH = import.meta.env.VITE_BUNDLE_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_BUNDLE_DESCRIPTION_MAX_LENGTH
const IMAGE_MAX_SIZE = import.meta.env.VITE_FILE_MAX_SIZE

interface FormValues {
  name: string
  description: string
  classification: string
}

interface CreateBundleFormProps {
  packageId: string
}
const CreateBundleForm: FC<CreateBundleFormProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const navigate = useNavigate()
  const { setLoading } = useFullScreenLoading()

  const [imageFile, setImageFile] = useState<File | undefined>()
  const [supportedClassifications, setSupportedClassifications] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  const imageOnLoaded = useCallback<OnLoaded>(({ file }) => {
    setImageFile(file)
  }, [])

  useEffect(() => {
    service
      ?.getSupportedClassifications()
      .then(response => {
        setSupportedClassifications(response)
      })
      .catch(error => {
        console.error(error)
        enqueueSnackbar(error.message, {
          variant: 'error',
        })
      })
  }, [service])

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        if (!service) {
          return
        }
        setLoading(true)
        const logo: DeployPackageMetadata['logo'] = imageFile
          ? { type: imageFile.type, value: await fileToUint8Array(imageFile) }
          : undefined

        const bundleId = await service.createBundle({ tags, logo, ...values })
        enqueueSnackbar('Bundle has been created ', { variant: 'success' })
        setLoading(false)
        navigate(`/package/${packageId}/bundle/${bundleId}`)
      } catch (error) {
        enqueueSnackbar('Deploy failed', { variant: 'error' })
        console.error(error)
        setLoading(false)
      }
    },
    [imageFile, navigate, packageId, service, setLoading, tags],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      classification: '',
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
      classification: Yup.string().required('Required!'),
    }),
    onSubmit,
  })

  const handleClassificationChanged = useCallback(
    (value: string) => {
      form.setFieldValue('classification', value)
    },
    [form],
  )

  const handleTagsChange = useCallback((newTags: string[]) => {
    setTags(newTags)
  }, [])

  return (
    <div>
      <div className={styles.grid}>
        <div>
          <form onSubmit={form.handleSubmit} id="create-bundle-form">
            <TextInput
              name="name"
              label="Name"
              placeholder="Set bundle name"
              value={form.values.name}
              onChange={form.handleChange}
              error={form.errors.name}
              className={styles.input}
            />
            <TextArea
              name="description"
              label="Description"
              placeholder="Set bundle description"
              value={form.values.description}
              onChange={form.handleChange}
              error={form.errors.description}
              className={styles.input}
              rows={3}
            />
            <Select
              className={clsx(styles.input, styles['input--short'])}
              placeholder="Select classification"
              label="Classification"
              defaultValue={form.initialValues.classification}
              options={supportedClassifications}
              onSelect={handleClassificationChanged}
              error={form.errors.classification}
            />
          </form>
          <TagsForm tags={tags} onChange={handleTagsChange} />
        </div>
        <div>
          <ImageInput maxSize={IMAGE_MAX_SIZE} onLoaded={imageOnLoaded} className={styles.img} />
        </div>
      </div>
      <Button type="submit" form="create-bundle-form" text="Create" className={styles.btn} />
    </div>
  )
}

export default CreateBundleForm
