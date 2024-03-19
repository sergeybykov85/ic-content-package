import type { FC, ReactNode } from 'react'

interface IfProps {
  condition: boolean | null | undefined
  children: ReactNode
}

const If: FC<IfProps> = ({ children, condition }) => (condition ? <>{children}</> : null)

export default If
