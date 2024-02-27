import { type FC } from 'react'
import styles from './PackageCard.module.scss'
import { type Package } from '~/models/Package.ts'
import Card from '~/components/general/Card'
interface PackageCardProps {
  data: Package
}
const PackageCard: FC<PackageCardProps> = ({ data }) => (
  <Card label={data.submission} title={data.name} logoUrl={data.logoUrl}>
    <p className={styles.created}>
      Created: <span>{data.created}</span>
    </p>
  </Card>
)

export default PackageCard
