import { render, screen } from '@testing-library/react'
import ExternalLink from './ExternalLink'
import { describe, expect, test } from 'vitest'

describe('ExternalLink component', () => {
  render(<ExternalLink>Link</ExternalLink>)
  test('anchor tag leads to the new tab', () => {
    const anchorTag = screen.getByText('Link')
    expect(anchorTag).toHaveAttribute('target', '_blank')
    expect(anchorTag).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(anchorTag).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })
})
