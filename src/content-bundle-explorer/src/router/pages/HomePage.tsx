import { type FC } from 'react'
import RecentPackages from '~/components/features/RecentPackages'
import PackagesByFilter from '~/components/features/PackagesByFilter'

const HomePage: FC = () => {
  return (
    <div>
      <PackagesByFilter />
      <RecentPackages />
    </div>
  )
}

export default HomePage
