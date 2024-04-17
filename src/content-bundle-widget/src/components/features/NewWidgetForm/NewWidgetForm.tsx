import styles from './NewWidgetForm.module.scss'
import { type FC, useCallback, useId, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import type { WidgetCreationParams } from '~/types/widgetTypes.ts'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Checkbox from '~/components/general/Checkbox'
import Button from '~/components/general/Button'
import BundleIdsForm from '~/components/features/NewWidgetForm/BundleIdsForm.tsx'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import BundleOptionsForm from '~/components/features/NewWidgetForm/BundleOptionsForm.tsx'
import type { ADDITIONS_CATEGORIES, POI_CATEGORIES } from '~/types/bundleTypes.ts'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'

const NAME_MAX_LENGTH = import.meta.env.VITE_WIDGET_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_WIDGET_DESCRIPTION_MAX_LENGTH

type FormValues = Pick<WidgetCreationParams, 'name' | 'description' | 'packageId'>

const NewWidgetForm: FC = () => {
  const formId = useId()
  const { widgetService } = useServices()
  const { setLoading } = useFullScreenLoading()
  const navigate = useNavigate()

  const [isDraft, setIsDraft] = useState(false)
  const [bundleIds, setBundleIds] = useState<string[]>([])
  const [categories, setCategories] = useState<{
    poiCategories: POI_CATEGORIES[]
    additionsCategories: ADDITIONS_CATEGORIES[]
  }>({
    poiCategories: [],
    additionsCategories: [],
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true)
        const widgetId = await widgetService.createWidget({
          ...values,
          isDraft,
          bundleIds,
          ...categories,
        })
        console.info(widgetId)
        enqueueSnackbar('Widget successfully created', { variant: 'success' })
        navigate('/my-widgets')
      } catch (error) {
        console.error(error)
        enqueueSnackbar(parseErrorMsg(error), { variant: 'error' })
      } finally {
        setLoading(false)
      }
    },
    [bundleIds, categories, isDraft, navigate, setLoading, widgetService],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      packageId: '',
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
      packageId: Yup.string().required('Required!'), // TODO: validation
    }),
    onSubmit,
  })

  return (
    <div>
      <div className={styles.grid}>
        <div className={styles.main}>
          <form onSubmit={form.handleSubmit} className={styles.form} id={formId}>
            <TextInput
              name="name"
              label="Name"
              placeholder="Set widget name"
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
            <TextInput
              name="packageId"
              label="Package ID"
              placeholder="Set package ID"
              value={form.values.packageId}
              onChange={form.handleChange}
              error={form.errors.packageId}
              className={styles.input}
            />
          </form>
          <BundleIdsForm onChange={ids => setBundleIds(ids)} />
        </div>
        <BundleOptionsForm className={styles.options} onChange={setCategories} />
      </div>
      <div className={styles.footer}>
        <Button type="submit" text="Submit" className={styles.btn} form={formId} />
        <Checkbox
          label="Save as Draft"
          checked={isDraft}
          onChange={e => setIsDraft(e.target.checked)}
          className={styles.checkbox}
        />
      </div>
    </div>
  )
}

export default NewWidgetForm
