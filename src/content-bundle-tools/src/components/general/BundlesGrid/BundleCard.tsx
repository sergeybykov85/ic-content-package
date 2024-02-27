import type Bundle from '~/models/Bundle.ts'
import { type FC, useMemo } from 'react'
import Card from '~/components/general/Card'
import styles from './BundleCard.module.scss'
import shortenPrincipal from '~/utils/shortenPrincipal.ts'

interface BundleCardProps {
  data: Bundle
}

const BundleCard: FC<BundleCardProps> = ({ data }) => {
  const creator = useMemo(() => shortenPrincipal(data.creator), [data.creator])
  const label = useMemo(() => data.classification.replace('_', ' '), [data.classification])
  return (
    <Card label={label} title={data.name} logoUrl={data.logoUrl}>
      <div className={styles.footer}>
        <p>
          Creator: <span>{creator}</span>
        </p>
        <p>
          Created: <span>{data.created}</span>
        </p>
      </div>
    </Card>
  )
}

export default BundleCard
