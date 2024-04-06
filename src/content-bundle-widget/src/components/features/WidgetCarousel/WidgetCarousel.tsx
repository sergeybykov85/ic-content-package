import { type FC, type ReactNode, useCallback, useState } from 'react'
import styles from './WidgetCarousel.module.scss'
import If from '~/components/general/If.tsx'
import IconButton from '~/components/general/IconButton'
import clsx from 'clsx'

interface WidgetCarouselProps {
  children: ReactNode[]
}

const WidgetCarousel: FC<WidgetCarouselProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0)

  const handleNextClick = useCallback(() => {
    setCurrentPage(prevState => (prevState + 1 === children.length ? 0 : prevState + 1))
  }, [children])

  const handlePrevClick = useCallback(() => {
    setCurrentPage(prevState => (prevState === 0 ? children.length - 1 : prevState - 1))
  }, [children])

  return (
    <If condition={children.length > 0}>
      <div className={styles.container}>
        <If condition={children.length > 1}>
          <IconButton iconName="arrow-back.svg" onClick={handlePrevClick} className={styles.btn} />
        </If>
        <div className={styles.slide}>{children[currentPage]}</div>
        <If condition={children.length > 1}>
          <IconButton
            iconName="arrow-back.svg"
            onClick={handleNextClick}
            className={clsx(styles.btn, styles['btn--next'])}
          />
        </If>
      </div>
    </If>
  )
}

export default WidgetCarousel
