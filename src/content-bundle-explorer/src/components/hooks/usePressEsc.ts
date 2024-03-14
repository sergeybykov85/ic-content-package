import { useEffect } from 'react'
const usePressEsc = (onPress: () => void): void => {
  useEffect(() => {
    const onPressEsc = (event: KeyboardEvent): void => {
      event.key === 'Escape' && onPress()
    }
    document.addEventListener('keyup', onPressEsc)
    return () => {
      document.removeEventListener('keyup', onPressEsc)
    }
  }, [onPress])
}

export default usePressEsc
