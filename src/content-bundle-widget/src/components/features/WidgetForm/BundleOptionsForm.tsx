import { type ChangeEventHandler, type FC, useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import Checkbox from '~/components/general/Checkbox'
import type { BUNDLE_DATA_GROUPS } from '~/types/bundleTypes.ts'
import { ADDITIONS_CATEGORIES, POI_CATEGORIES } from '~/types/bundleTypes.ts'
import styles from './WidgetForm.module.scss'

interface BundleOptionsFormProps {
  className?: string
  onChange: (categories: { poiCategories: POI_CATEGORIES[]; additionsCategories: ADDITIONS_CATEGORIES[] }) => void
  initOptions?: {
    [BUNDLE_DATA_GROUPS.POI]?: POI_CATEGORIES[]
    [BUNDLE_DATA_GROUPS.Additions]?: ADDITIONS_CATEGORIES[]
  }
}

const BundleOptionsForm: FC<BundleOptionsFormProps> = ({ className, onChange, initOptions }) => {
  const [poiCategories, setPoiCategories] = useState<POI_CATEGORIES[]>(initOptions?.POI || [])
  const [additionsCategories, setAdditionsCategories] = useState<ADDITIONS_CATEGORIES[]>(initOptions?.Additions || [])

  const handlePoiChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    if (event.target.checked) {
      setPoiCategories(prevState => [...prevState, event.target.name as POI_CATEGORIES])
    } else {
      setPoiCategories(prevState => prevState.filter(i => i !== event.target.name))
    }
  }, [])

  const handleAdditionsChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    if (event.target.checked) {
      setAdditionsCategories(prevState => [...prevState, event.target.name as ADDITIONS_CATEGORIES])
    } else {
      setAdditionsCategories(prevState => prevState.filter(i => i !== event.target.name))
    }
  }, [])

  useEffect(() => {
    onChange({ poiCategories, additionsCategories })
  }, [additionsCategories, onChange, poiCategories])

  return (
    <div className={clsx(className)}>
      <p>Add POI:</p>
      <div className={styles.categories}>
        {Object.values(POI_CATEGORIES).map(item => (
          <Checkbox
            key={item}
            label={item === POI_CATEGORIES.AudioGuide ? 'Audio Guide' : item}
            checked={poiCategories.includes(item)}
            name={item}
            onChange={handlePoiChange}
          />
        ))}
      </div>
      <p>Add Additions:</p>
      <div className={styles.categories}>
        {Object.values(ADDITIONS_CATEGORIES).map(item => (
          <Checkbox
            key={item}
            label={item}
            checked={additionsCategories.includes(item)}
            name={item}
            onChange={handleAdditionsChange}
          />
        ))}
      </div>
    </div>
  )
}

export default BundleOptionsForm
