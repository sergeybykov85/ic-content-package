import { useCallback, useEffect, useState } from 'react'

type ThrowError = (error: unknown, customMessage: string) => void

const useError = (): ThrowError => {
  const [error, setError] = useState<unknown>()

  const throwError = useCallback<ThrowError>((error, customMessage) => {
    console.error(error)
    setError(customMessage ? new Error(customMessage) : error)
  }, [])

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return throwError
}

export default useError
