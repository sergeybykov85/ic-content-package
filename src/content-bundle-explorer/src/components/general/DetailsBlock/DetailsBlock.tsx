import { type FC, useCallback, useMemo } from 'react'
import styles from './DetailsBlock.module.scss'
import clsx from 'clsx'
import Chip from '~/components/general/Chip'
import copyToClipboard from '~/utils/copyToClipboard.ts'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If'
import type Package from '~/models/Package.ts'

interface DetailsBlockProps {
  className?: string
  data: {
    name: string
    description: string
    logoUrl?: string
    tags?: string[]
    created: string
    creator: string
    owner: string
    submission?: string
    classification?: string
    totalBundles?: number
    maxSupply?: Package['maxSupply']
  }
}

const DetailsBlock: FC<DetailsBlockProps> = ({ data, className }) => {
  const { tags = [] } = data

  const blackLabel = useMemo(
    () => (data.submission || data.classification || '').replace('_', ' '),
    [data.classification, data.submission],
  )

  const supply = useMemo(() => {
    if (data.totalBundles || data.maxSupply) {
      return `${data.totalBundles} / ${data.maxSupply}`
    }
  }, [data.maxSupply, data.totalBundles])

  const handleCopyId = useCallback((value: string) => {
    copyToClipboard(value, () => {
      enqueueSnackbar('Copied to clipboard', {
        variant: 'success',
        preventDuplicate: false,
      })
    })
  }, [])

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.info}>
        <div>
          <h3 className={styles.title}>{data.name}</h3>
          <p>{data.description}</p>
          <ul className={styles.details}>
            <li>
              Type:
              <Chip className={styles.label} text={blackLabel} />
            </li>
            <li>
              Created:
              <span>{data.created}</span>
            </li>
            <li>
              Creator:
              <span className={styles['clickable-id']} onClick={() => handleCopyId(data.creator)}>
                {data.creator}
              </span>
            </li>
            <li>
              Owner:
              <span className={styles['clickable-id']} onClick={() => handleCopyId(data.owner)}>
                {data.owner}
              </span>
            </li>
            <If condition={Boolean(supply)}>
              <li>
                Supply:
                <span>{supply}</span>
              </li>
            </If>
          </ul>
          <div className={styles.tags}>
            {tags.map(tag => (
              <Chip key={tag} text={tag} color="blue" />
            ))}
          </div>
        </div>
      </div>
      <img
        src={data.logoUrl || '/images/empty-image.svg'}
        alt={`Cover image for: ${data.name}`}
        className={styles.img}
      />
    </div>
  )
}

export default DetailsBlock
