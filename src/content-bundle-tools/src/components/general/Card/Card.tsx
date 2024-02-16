import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './Card.module.scss'
import If from '~/components/general/If'

interface CardProps {
  title: string
  label?: string
  logoUrl?: string
  className?: string
  children: ReactNode
}

const Card: FC<CardProps> = ({ logoUrl, title, label, children, className }) => {
  const imgSrc = useMemo(() => logoUrl || '/images/empty-image.svg', [logoUrl])

  return (
    <div className={clsx(styles.card, className)}>
      <img src={imgSrc} alt={`Picture for: ${title}`} />
      <If condition={Boolean(label)}>
        <span className={styles.label}>{label}</span>
      </If>
      <h3 className={styles.title}>{title}</h3>
      <div>{children}</div>
    </div>
  )
}

export default Card
