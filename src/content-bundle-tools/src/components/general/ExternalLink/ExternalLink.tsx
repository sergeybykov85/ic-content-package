import type { AnchorHTMLAttributes, FC } from 'react'

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

const ExternalLink: FC<ExternalLinkProps> = (props) => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {props.children}
  </a>
)

export default ExternalLink
