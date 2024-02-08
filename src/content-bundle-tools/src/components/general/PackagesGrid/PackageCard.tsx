import { type FC, useMemo } from 'react'
import styles from '~/components/general/PackagesGrid/PackageCard.module.scss'
import { type Package } from '~/models/Package.tsx'
interface PackageCardProps {
  data: Package
}
const PackageCard: FC<PackageCardProps> = ({ data }) => {
  const logoUrl = useMemo(() => data.logo_url?.[0] || '/images/empty-image.svg', [data.logo_url]) // TODO: Image is optional
  const created = useMemo(() => {
    return new Date(Number(data.created) / 1000000).toLocaleDateString()
  }, [data.created])
  console.log(data)
  return (
    <div className={styles.card}>
      <img src={logoUrl} alt={`${data.name} package picture`} />
      <h3 className={styles.name}>{data.name}</h3>
      <p className={styles.submission}>{data.submission}</p>
      <p className={styles.created}>
        Created: <span>{created}</span>
      </p>
    </div>
  )
}

export default PackageCard
