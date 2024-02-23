import { type FC, type ReactNode, useCallback, useEffect, useState } from 'react'
import { FullScreenLoadingContext } from '~/context/FullScreenLoadingContext/index.ts'
import Loader from '~/components/general/Loader'
import If from '~/components/general/If'
import styles from './FullScreenLoadingProvider.module.scss'

const FullScreenLoadingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoadingState] = useState(false)

  const setLoading = useCallback((value: boolean) => {
    setLoadingState(value)
  }, [])

  useEffect(() => {
    if (loading) {
      document.body.classList.add('disable-scroll')
    } else {
      document.body.classList.contains('disable-scroll') && document.body.classList.remove('disable-scroll')
    }
  }, [loading])

  return (
    <>
      <FullScreenLoadingContext.Provider value={{ setLoading, loading }}>{children}</FullScreenLoadingContext.Provider>
      <If condition={loading}>
        <div className={styles.loader}>
          <Loader />
        </div>
      </If>
    </>
  )
}

export default FullScreenLoadingProvider
