import { useCallback, useEffect, useState } from 'react'

type ThrowError = (error: unknown, customMessage: string) => void

/**
 * React Router error handler doesn't catch errors thrown from useCallback, but catches errors from useEffect.
 * That's why this hook has been created
 */
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
