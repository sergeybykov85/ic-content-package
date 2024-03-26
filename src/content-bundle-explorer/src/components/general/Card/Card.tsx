import type { FC } from 'react'
import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './Card.module.scss'
import If from '~/components/general/If'
import Chip from '~/components/general/Chip'
import shortenPrincipal from '~/utils/shortenPrincipal.ts'

interface CardProps {
  data: {
    title: string
    label?: string
    logoUrl?: string
    creator: string
    created: string
  }
  className?: string
}

const Card: FC<CardProps> = ({ data, className }) => {
  const imgSrc = useMemo(() => data.logoUrl || '/images/empty-image.svg', [data.logoUrl])
  const shortCreator = useMemo(() => shortenPrincipal(data.creator), [data.creator])
  const label = useMemo(() => (data.label ? data.label.replace('_', ' ') : ''), [data.label])

  return (
    <div className={clsx(styles.card, className)}>
      <img src={imgSrc} alt={`Picture for: ${data.title}`} />
      <If condition={Boolean(label)}>
        <Chip text={label!} className={styles.label} />
      </If>
      <h3 className={styles.title}>{data.title}</h3>
      <div className={styles.footer}>
        <p>
          Creator: <span>{shortCreator}</span>
        </p>
        <p>
          Created: <span>{data.created}</span>
        </p>
      </div>
    </div>
  )
}

export default Card
