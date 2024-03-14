import { type FC } from 'react'
import RecentPackages from '~/components/features/RecentPackages'
import SearchFilters from '~/components/features/SearchFilters'

const HomePage: FC = () => {
  return (
    <div>
      <SearchFilters />
      <RecentPackages />
    </div>
  )
}

export default HomePage
