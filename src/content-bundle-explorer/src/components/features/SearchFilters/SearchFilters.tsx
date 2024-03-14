import { type FC, useCallback, useEffect, useState } from 'react'
import { type Filters, PACKAGE_TYPES } from '~/types/packageTypes.ts'
import { useServices } from '~/context/ServicesContext'
import Select from '~/components/general/Select'

interface FiltersProps {}

const SearchFilters: FC<FiltersProps> = () => {
  const [filters, setFilters] = useState<Filters>({})

  const { packageRegistryService } = useServices()

  const handleSelectChange = useCallback((value: string, name?: string) => {
    setFilters(prevState => ({ ...prevState, [name!]: value !== 'None' ? value : '' }))
  }, [])

  useEffect(() => {
    packageRegistryService.getPackagesByFilters(0, 12, filters).then(packages => console.info(packages))
  }, [packageRegistryService, filters])

  return (
    <div>
      <Select
        label="Type"
        placeholder="Choose type"
        defaultValue={filters.kind || ''}
        options={['None', ...Object.values(PACKAGE_TYPES)]}
        name="kind"
        onSelect={handleSelectChange}
      />
    </div>
  )
}

export default SearchFilters
