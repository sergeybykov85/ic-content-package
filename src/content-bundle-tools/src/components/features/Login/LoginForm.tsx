import React, { type FC, useCallback } from 'react'
import Button from 'components/general/Button'
import styles from './LoginForm.module.scss'
import { useAuth } from 'context/AuthContext'
import FileInput, { type FileInputProps } from 'components/general/FileInput'
import decodeIdentity from 'utils/decodeIdentity'

const LoginForm: FC = () => {
  const { login } = useAuth()
  const onLoaded = useCallback<FileInputProps['onLoaded']>(result => {
    if (typeof result === 'string') {
      const identity = decodeIdentity(result)
      console.log(identity.getPrincipal().toText())
    }
  }, [])
  return (
    <div className={styles.container}>
      <Button onClick={login}>
        Internet Identity <img src="/images/icp-logo.svg" alt="ICP logo" />
      </Button>
      <Button variant="text" className={styles.file}>
        <FileInput accept=".pem" onLoaded={onLoaded} getAs="string">
          Log in with PEM file
        </FileInput>
      </Button>
      <Button disabled>
        MetaMask <img src="/images/metamask-logo.svg" alt="ICP logo" />
      </Button>
      <Button disabled>
        WalletConnect <img src="/images/walletconnect-logo.svg" alt="ICP logo" />
      </Button>
    </div>
  )
}

export default LoginForm
