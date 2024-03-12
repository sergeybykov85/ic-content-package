import type Bundle from '~/models/Bundle.ts'
import { type FC, useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Select from '~/components/general/Select'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import TagsForm from '~/components/features/BundleForms/TagsForm.tsx'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import Button from '~/components/general/Button'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type { BundleUpdateParams } from '~/types/bundleTypes.ts'
import clsx from 'clsx'
import styles from './BundleForms.module.scss'

const NAME_MAX_LENGTH = import.meta.env.VITE_BUNDLE_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_BUNDLE_DESCRIPTION_MAX_LENGTH
const IMAGE_MAX_SIZE = import.meta.env.VITE_FILE_MAX_SIZE

interface EditBundleFormProps {
  packageId: string
  bundleId: string
  initData: Pick<Bundle, 'name' | 'description' | 'logoUrl' | 'tags' | 'classification'>
}

type FormValues = Pick<Bundle, 'name' | 'description' | 'classification'>

const EditBundleForm: FC<EditBundleFormProps> = ({ packageId, bundleId, initData }) => {
  const { initBundlePackageService } = useServices()
  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const formId = useId()
  const { setLoading } = useFullScreenLoading()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [supportedClassifications, setSupportedClassifications] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>(initData.tags)
  const [imageFile, setImageFile] = useState<File | undefined>()

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
        const logo: BundleUpdateParams['logo'] = imageFile
          ? { type: imageFile.type, value: await fileToUint8Array(imageFile) }
          : undefined

        await service.updateBundle(bundleId, { ...values, logo, tags })
        enqueueSnackbar('Bundle has been updated ', { variant: 'success' })
        setLoading(false)
        navigate(`/package/${packageId}/bundle/${bundleId}`, { state })
      } catch (error) {
        enqueueSnackbar('Update failed', { variant: 'error' })
        console.error(error)
        setLoading(false)
      }
    },
    [bundleId, imageFile, navigate, packageId, service, setLoading, state, tags],
  )

  const form = useFormik<FormValues>({
    initialValues: initData,
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

  const imageOnLoaded = useCallback<OnLoaded>(({ file }) => {
    setImageFile(file)
  }, [])

  return (
    <div>
      <div className={styles.grid}>
        <div>
          <form onSubmit={form.handleSubmit} id={formId}>
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
              rows={3}
              className={styles.input}
            />
            <Select
              placeholder="Select classification"
              label="Classification"
              defaultValue={form.initialValues.classification}
              options={supportedClassifications}
              onSelect={handleClassificationChanged}
              error={form.errors.classification}
              className={clsx(styles.input, styles['input--short'])}
            />
          </form>
          <TagsForm tags={tags} onChange={handleTagsChange} />
        </div>
        <div>
          <ImageInput maxSize={IMAGE_MAX_SIZE} onLoaded={imageOnLoaded} src={initData.logoUrl} className={styles.img} />
        </div>
      </div>
      <Button type="submit" form={formId} text="Update" className={styles.btn} />
    </div>
  )
}

export default EditBundleForm
