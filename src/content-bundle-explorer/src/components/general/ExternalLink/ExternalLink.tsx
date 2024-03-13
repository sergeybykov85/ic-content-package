import type { AnchorHTMLAttributes, FC } from 'react'

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

const ExternalLink: FC<ExternalLinkProps> = props => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {props.children}
  </a>
)

export default ExternalLink
