import { type FC, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

interface CollapseProps {
  open: boolean
  children: ReactNode
  className?: string
}

const TRANSITION_DURATION = 300 // milliseconds

const Collapse: FC<CollapseProps> = ({ open, children, className }) => {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [overflowHidden, setOverflowHidden] = useState(true)

  const observer = useMemo(
    () =>
      new ResizeObserver(entries => {
        const element = entries.find(item => item.target.id === id)
        if (element && element.target.clientHeight !== height) {
          setHeight(element.target.clientHeight)
        }
      }),
    [height, id],
  )

  useEffect(() => {
    const divElement = ref.current
    divElement && observer.observe(divElement)
    return () => {
      divElement && observer.unobserve(divElement)
    }
  }, [observer])

  useEffect(() => {
    if (open) {
      setTimeout(() => setOverflowHidden(false), TRANSITION_DURATION)
    } else {
      setOverflowHidden(true)
    }
  }, [open])

  return (
    <div
      className={clsx(className)}
      style={{
        height: open ? height : 0,
        overflow: overflowHidden ? 'hidden' : 'initial',
        transition: `height ${TRANSITION_DURATION}ms ease-in-out`,
      }}
    >
      <div id={id} ref={ref}>
        {children}
      </div>
    </div>
  )
}

export default Collapse
