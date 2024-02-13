import { type FC, useMemo } from 'react'
import styles from '~/components/general/PackagesGrid/PackageCard.module.scss'
import { type Package } from '~/models/Package.ts'
interface PackageCardProps {
  data: Package
}
const PackageCard: FC<PackageCardProps> = ({ data }) => {
  const logoUrl = useMemo(() => data.logoUrl || '/images/empty-image.svg', [data.logoUrl])

  return (
    <div className={styles.card}>
      <img src={logoUrl} alt={`${data.name} package picture`} />
      <h3 className={styles.name}>{data.name}</h3>
      <p className={styles.submission}>{data.submission}</p>
      <p className={styles.created}>
        Created: <span>{data.created}</span>
      </p>
    </div>
  )
}

export default PackageCard
