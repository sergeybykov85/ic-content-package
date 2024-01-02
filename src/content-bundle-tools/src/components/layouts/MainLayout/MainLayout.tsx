import type { FC, ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <>
    <header>Here will be header</header>
    <main>{children}</main>
    <footer>Here will be footer</footer>
  </>
)

export default MainLayout
