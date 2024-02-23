import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import { TextArea, TextInput } from '~/components/general/Inputs'
import styles from './DeployBundleForm.module.scss'
import ImageInput, { type OnLoaded } from '~/components/general/ImageInput'
import Button from '~/components/general/Button'
import * as Yup from 'yup'
import Select from '~/components/general/Select'
import { useServices } from '~/context/ServicesContext'
import { enqueueSnackbar } from 'notistack'
import clsx from 'clsx'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import type { DeployPackageMetadata } from '~/types/packagesTypes.ts'
import fileToUint8Array from '~/utils/fileToUint8Array.ts'
import { useNavigate } from 'react-router-dom'

const NAME_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 300

interface FormValues {
  name: string
  description: string
  classification: string
}

interface DeployBundleFormProps {
  packageId: string
}
const DeployBundleForm: FC<DeployBundleFormProps> = ({ packageId }) => {
  const { initBundlePackageService } = useServices()
  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const navigate = useNavigate()
  const { setLoading } = useFullScreenLoading()

  const [imageFile, setImageFile] = useState<File | undefined>()
  const [supportedClassifications, setSupportedClassifications] = useState<string[]>([])

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

        const bundleId = await service.createBundle({ tags: [], logo, ...values })
        enqueueSnackbar('Bundle has been created ', { variant: 'success' })
        setLoading(false)
        navigate(`/package/${packageId}/bundle/${bundleId}`)
      } catch (error) {
        enqueueSnackbar('Deploy failed', { variant: 'error' })
        console.error(error)
        setLoading(false)
      }
    },
    [imageFile, navigate, packageId, service, setLoading],
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

  return (
    <form onSubmit={form.handleSubmit}>
      <div className={styles.grid}>
        <div>
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
            label="Classification"
            defaultValue={form.initialValues.classification}
            options={supportedClassifications}
            onSelect={handleClassificationChanged}
            error={form.errors.classification}
          />
        </div>
        <div>
          <ImageInput maxSize={2097152} onLoaded={imageOnLoaded} className={styles.img} />
        </div>
      </div>
      <Button type="submit" text="Deploy" className={styles.btn} />
    </form>
  )
}

export default DeployBundleForm
