import { type FC } from 'react'
import { type PackageType } from '~/services/packageRegistry.ts'
import PackageCard from './PackageCard.tsx'
import styles from './Packages.module.scss'
import { useRecoilValueLoadable } from 'recoil'
import { getPackageByTypeSelector } from '~/recoil/packages/packagesStore.ts'

interface PackagesProps {
  type: PackageType
}

const Packages: FC<PackagesProps> = ({ type }) => {
  const packages = useRecoilValueLoadable(getPackageByTypeSelector(type))

  // TODO: Skeleton while loading
  // TODO: Empty list
  if (packages.state === 'hasValue') {
    return (
      <section className={styles.section}>
        <div className={styles.grid}>
          {packages.contents.map(item => (
            <PackageCard data={item} key={item.id} />
          ))}
        </div>
      </section>
    )
  }
}

export default Packages
