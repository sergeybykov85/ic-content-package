import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useServices } from '~/context/ServicesContext'
import type Bundle from '~/models/Bundle.ts'
import DetailsBlock from '~/components/general/DetailsBlock'
import { useFullScreenLoading } from '~/context/FullScreenLoadingContext'
import { enqueueSnackbar } from 'notistack'
import If from '~/components/general/If'
import { ADDITIONAL_DATA_GROUPS } from '~/types/bundleTypes.ts'
import CopyBtn from '~/components/general/CopyBtn'
import styles from './BundleDetailsBlock.module.scss'
import BundleControls from '~/components/features/BundleControls'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~/context/AuthContext'
import AdditionalData from '~/components/features/AdditionalData'
import NewAdditionalDataModal from '~/components/features/NewAdditionalDataModal'

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
  const [supportedDataGroups, setSupportedDataGroups] = useState<ADDITIONAL_DATA_GROUPS[]>([])
  const [possibilityToModify, setPossibilityToModify] = useState(false)
  const [newDataGroup, setNewDataGroup] = useState<ADDITIONAL_DATA_GROUPS | null>(null)

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
    if (!supportedDataGroups.length) {
      service
        ?.getBundleSupportedDataGroups()
        .then(response => {
          setSupportedDataGroups(response)
        })
        .catch(error => {
          console.error(error)
          enqueueSnackbar(error.message, {
            variant: 'error',
          })
        })
    }
  }, [service, supportedDataGroups.length])

  useEffect(() => {
    if (service && principal) {
      service
        .checkPossibilityToModifyBundle(bundleId, principal)
        .then(response => {
          setPossibilityToModify(response)
        })
        .catch(error => {
          console.error(error)
          enqueueSnackbar(error.message, {
            variant: 'error',
          })
        })
    }
  }, [bundleId, principal, service])

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
            <If condition={possibilityToModify}>
              <BundleControls {...{ bundleId, service, onDeleteSuccess }} />
            </If>
          }
        />
        <If condition={supportedDataGroups.includes(ADDITIONAL_DATA_GROUPS.POI)}>
          <br />
          <AdditionalData
            title="Point of interest"
            type={ADDITIONAL_DATA_GROUPS.POI}
            editable={possibilityToModify}
            onPlusClick={group => setNewDataGroup(group)}
            {...{ bundleId, service, bundle }}
          />
        </If>
        <If condition={supportedDataGroups.includes(ADDITIONAL_DATA_GROUPS.Additions)}>
          <br />
          <AdditionalData
            title="Additional informartion"
            type={ADDITIONAL_DATA_GROUPS.Additions}
            editable={possibilityToModify}
            onPlusClick={group => setNewDataGroup(group)}
            {...{ bundleId, service, bundle }}
          />
        </If>
        <NewAdditionalDataModal
          group={newDataGroup}
          supportedGroups={supportedDataGroups}
          onClose={() => setNewDataGroup(null)}
          service={service}
        />
      </>
    )
  }
}

export default BundleDetailsBlock
