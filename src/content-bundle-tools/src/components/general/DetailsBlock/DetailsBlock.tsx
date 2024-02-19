import type { FC, ReactNode } from 'react'
import styles from './DetailsBlock.module.scss'
import clsx from 'clsx'

interface DetailsBlockProps {
  title: string
  description: string
  imgSrc?: string
  children?: ReactNode
  className?: string
}

const DetailsBlock: FC<DetailsBlockProps> = ({ title, description, imgSrc, children, className }) => (
  <div className={clsx(styles.container, className)}>
    <div>
      <h3 className={styles.title}>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
    <img src={imgSrc || '/images/empty-image.svg'} alt={`Cover image for: ${title}`} className={styles.img} />
  </div>
)

export default DetailsBlock
