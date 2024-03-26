import type { RefObject } from 'react'
import { useRef, useEffect } from 'react'

const useClickAway = <T extends HTMLElement>(onClickAway: () => void): RefObject<T> => {
  const ref = useRef<T>(null)

  useEffect(() => {
    const clickAwayHandler = (event: MouseEvent): void => {
      if (!ref.current?.contains(event.target as Node)) {
        onClickAway()
      }
    }
    document.addEventListener('click', clickAwayHandler)
    return () => {
      document.removeEventListener('click', clickAwayHandler)
    }
  }, [onClickAway, ref])

  return ref
}

export default useClickAway
