import { type FC, type ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

interface CollapseProps {
  open: boolean
  children: ReactNode
  className?: string
}

const TRANSITION_DURATION = 300 // milliseconds

const Collapse: FC<CollapseProps> = ({ open, children, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [overflowHidden, setOverflowHidden] = useState(true)

  useEffect(() => {
    const clientHeight = ref.current?.clientHeight
    if (open && clientHeight && height !== clientHeight) {
      setHeight(ref.current?.clientHeight)
    }
  }, [height, open, children])

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
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default Collapse
