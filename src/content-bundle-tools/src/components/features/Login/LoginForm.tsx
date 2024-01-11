import React, { type FC } from 'react'
import Button from 'components/general/Button'
import styles from './LoginForm.module.scss'
import { useAuth } from 'context/AuthContext'
import FileInput from 'components/general/FileInput'

const LoginForm: FC = props => {
  const { login } = useAuth()
  return (
    <div className={styles.container}>
      <Button onClick={login}>
        Internet Identity <img src="/images/icp-logo.svg" alt="ICP logo" />
      </Button>
      <Button variant="text" className={styles.file}>
        <FileInput accept=".pem" onLoaded={readerResult => console.log(readerResult)}>
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
