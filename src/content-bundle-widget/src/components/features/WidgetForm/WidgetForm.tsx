import styles from './WidgetForm.module.scss'
import { type FC, useCallback, useId, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import type { WidgetCreationParams } from '~/types/widgetTypes.ts'
import { WIDGET_STATUSES } from '~/types/widgetTypes.ts'
import { TextArea, TextInput } from '~/components/general/Inputs'
import Checkbox from '~/components/general/Checkbox'
import Button from '~/components/general/Button'
import BundleIdsForm from '~/components/features/WidgetForm/BundleIdsForm.tsx'
import { useServices } from '~/context/ServicesContext'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import BundleOptionsForm from '~/components/features/WidgetForm/BundleOptionsForm.tsx'
import type { ADDITIONS_CATEGORIES, POI_CATEGORIES } from '~/types/bundleTypes.ts'
import parseErrorMsg from '~/utils/parseErrorMsg.ts'
import type Widget from '~/models/Widget.ts'
import If from '~/components/general/If.tsx'

const NAME_MAX_LENGTH = import.meta.env.VITE_WIDGET_NAME_MAX_LENGTH
const DESCRIPTION_MAX_LENGTH = import.meta.env.VITE_WIDGET_DESCRIPTION_MAX_LENGTH

type FormValues = Required<Pick<WidgetCreationParams, 'name' | 'description' | 'packageId'>>

const WidgetForm: FC<{ widget?: Widget }> = ({ widget }) => {
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

  const createWidget = useCallback(
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
        window.open(`/widget-preview/${widgetId}`)
        navigate(`/widget-editor/${widgetId}`)
      } catch (error) {
        console.error(error)
        enqueueSnackbar(parseErrorMsg(error), { variant: 'error' })
        setLoading(false)
      }
    },
    [bundleIds, categories, isDraft, navigate, setLoading, widgetService],
  )

  const updateWidget = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true)
        await widgetService.updateWidget(widget!.id, {
          name: values.name,
          description: values.description,
          status: isDraft ? WIDGET_STATUSES.Draft : WIDGET_STATUSES.Active,
        })
        await widgetService.updateWidgetPayload(widget!.id, {
          options: categories,
          criteria: {
            packageId: values.packageId,
            bundleIds,
          },
        })
        enqueueSnackbar('Widget successfully updated', { variant: 'success' })
      } catch (error) {
        console.error(error)
        enqueueSnackbar(parseErrorMsg(error), { variant: 'error' })
      } finally {
        setLoading(false)
      }
    },
    [bundleIds, categories, isDraft, setLoading, widget, widgetService],
  )

  const form = useFormik<FormValues>({
    initialValues: {
      name: widget?.name || '',
      description: widget?.description || '',
      packageId: widget?.packageId || '',
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
      packageId: Yup.string().required('Required!'),
    }),
    onSubmit: widget ? updateWidget : createWidget,
  })

  const deleteWidget = useCallback(async () => {
    try {
      setLoading(true)
      await widgetService.removeWidget(widget!.id)
      enqueueSnackbar('Widget was successfully deleted', { variant: 'success' })
      navigate('/my-widgets')
    } catch (error) {
      setLoading(false)
      console.error(error)
      enqueueSnackbar(`Failed to delete widget with error: ${parseErrorMsg(error)}`, { variant: 'error' })
    }
  }, [navigate, setLoading, widget, widgetService])

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
          <BundleIdsForm onChange={ids => setBundleIds(ids)} initIds={widget?.bundleIds} />
        </div>
        <BundleOptionsForm
          className={styles.options}
          onChange={setCategories}
          initOptions={widget?.bundleDataToRender}
        />
      </div>
      <div className={styles.footer}>
        <Button type="submit" text="Submit" form={formId} />
        <Checkbox
          label="Save as Draft"
          checked={isDraft}
          onChange={e => setIsDraft(e.target.checked)}
          className={styles.checkbox}
        />
        <If condition={Boolean(widget)}>
          <Button text="Delete widget" variant="text" color="red" onClick={deleteWidget} className={styles.delete} />
        </If>
      </div>
    </div>
  )
}

export default WidgetForm
