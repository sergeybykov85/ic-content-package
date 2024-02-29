import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If'
import { ADDITIONAL_DATA_TYPES } from '~/types/bundleTypes.ts'
import { Additions, Poi } from '~/components/features/AdditionalData'
import CopyBtn from '~/components/general/CopyBtn'
import styles from './BundleDetailsBlock.module.scss'
import BundleControls from '~/components/features/BundleControls'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~/context/AuthContext'

interface BundleDetailsBlockProps {
  packageId: string
  bundleId: string
}

const BundleDetailsBlock: FC<BundleDetailsBlockProps> = ({ bundleId, packageId }) => {
  const { principal } = useAuth()
  const { setLoading } = useFullScreenLoading()
  const navigate = useNavigate()

  const { initBundlePackageService } = useServices()
  const service = useMemo(() => initBundlePackageService?.(packageId), [initBundlePackageService, packageId])

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [dataGroups, setDataGroups] = useState<ADDITIONAL_DATA_TYPES[]>([])

  const isShowControls = useMemo(() => principal === bundle?.owner, [bundle?.owner, principal])
  const isEmptyBundle = useMemo(() => !dataGroups.length, [dataGroups.length])

  useEffect(() => {
    setLoading(true)
    service
      ?.getBundle(bundleId)
      .then(response => {
        setBundle(response)
      })
      .catch(error => {
        console.error(error)
        navigate('/404')
      })
      .finally(() => setLoading(false))
  }, [bundleId, navigate, service, setLoading])

  useEffect(() => {
    if (!dataGroups.length) {
      service
        ?.getBundleDataGroups(bundleId)
        .then(response => setDataGroups(response))
        .catch(error => {
          console.error(error)
          enqueueSnackbar(error.message, {
            variant: 'error',
          })
        })
    }
  }, [service, dataGroups.length, bundleId])

  const onDeleteSuccess = useCallback(() => {
    navigate(`/package/${packageId}`, { replace: true })
  }, [navigate, packageId])

  if (service && bundle) {
    return (
      <>
        <h3 className={styles['sub-title']}>
          Package ID: {packageId} <CopyBtn text={packageId} />
        </h3>
        <DetailsBlock
          data={{ ...bundle, description: bundle.description || '' }}
          footer={
            <If condition={isShowControls}>
              <BundleControls
                btnClassName={styles['remove-btn']}
                {...{ bundleId, service, onDeleteSuccess, isEmptyBundle }}
              />
            </If>
          }
        />
        <If condition={dataGroups.includes(ADDITIONAL_DATA_TYPES.POI)}>
          <br />
          <Poi {...{ bundleId, service, bundle }} />
        </If>
        <If condition={dataGroups.includes(ADDITIONAL_DATA_TYPES.Additions)}>
          <br />
          <Additions {...{ bundleId, service, bundle }} />
        </If>
      </>
    )
  }
}

export default BundleDetailsBlock
