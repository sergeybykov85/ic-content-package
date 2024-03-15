import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { type DataSegmentationDto, type Filters, PACKAGE_TYPES } from '~/types/packageTypes.ts'
import { useServices } from '~/context/ServicesContext'
import Select from '~/components/general/Select'
import PackageGrid from '~/components/general/PackageGrid'
import type { Package } from '~/models/Package.ts'
import If from '~/components/general/If'
import EmptyBlock from '~/components/features/EmptyBlock'
import styles from './PackagesByFilter.module.scss'

type DataSegmentation = Omit<DataSegmentationDto, 'total_supply'>

interface FiltersProps {}

const PackagesByFilter: FC<FiltersProps> = () => {
  const [filters, setFilters] = useState<Filters>({})
  const [dataSegmentation, setDataSegmentation] = useState<DataSegmentation>({
    classifications: [],
    countries: [],
    tags: [],
  })
  const [packages, setPackages] = useState<Package[]>([])

  const emptyFilters = useMemo<boolean>(() => {
    return Object.values(filters).every(item => Boolean(!item))
  }, [filters])

  const { packageRegistryService } = useServices()

  const handleSelectChange = useCallback((value: string, name?: string) => {
    setFilters(prevState => ({ ...prevState, [name!]: value !== 'None' ? value : '' }))
  }, [])

  useEffect(() => {
    packageRegistryService.getPackagesByFilters(0, 12, filters).then(packages => setPackages(packages))
  }, [packageRegistryService, filters])

  useEffect(() => {
    packageRegistryService.getDataSegmentation().then(response => setDataSegmentation(response))
  }, [packageRegistryService])

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <Select
          label="Type"
          placeholder="Select..."
          defaultValue={filters.kind || ''}
          options={['None', ...Object.values(PACKAGE_TYPES)]}
          name="kind"
          onSelect={handleSelectChange}
        />
        <Select
          label="Classification"
          placeholder="Select..."
          defaultValue={filters.classification || ''}
          options={['None', ...dataSegmentation.classifications]}
          name="classification"
          onSelect={handleSelectChange}
        />
        <Select
          label="Country"
          placeholder="Select..."
          defaultValue={filters.countryCode || ''}
          options={['None', ...dataSegmentation.countries]}
          name="countryCode"
          onSelect={handleSelectChange}
        />
        <Select
          label="Tag"
          placeholder="Select..."
          defaultValue={filters.tag || ''}
          options={['None', ...dataSegmentation.tags]}
          name="tag"
          onSelect={handleSelectChange}
        />
      </div>
      <If condition={!packages.length}>
        <EmptyBlock variant={emptyFilters ? 'idle' : 'not-found'} />
      </If>
      <PackageGrid packages={packages} />
    </div>
  )
}

export default PackagesByFilter
