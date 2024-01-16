import { render, screen } from '@testing-library/react'
import MainLayout from './MainLayout'
import content from './MainLayout.content.json'
import { describe, expect, test } from 'vitest'

describe('MainLayout component', () => {
  describe('Header', () => {
    test('title rendered', () => {
      render(<MainLayout>some content</MainLayout>)
      const title = screen.getByText(content.headerTitle)
      expect(title).toBeInTheDocument()
    })
  })
  describe('Footer', () => {
    test('correct year', () => {
      render(<MainLayout>some content</MainLayout>)
      const actualYear = new Date().getFullYear().toString()
      const renderedYear = screen.getByText(new RegExp(actualYear, 'i'))
      expect(renderedYear).toBeInTheDocument()
    })
    test('social links', async () => {
      const { container } = render(<MainLayout>some content</MainLayout>)
      const dcmLink = container.querySelector(`a[href='${content.externalLinks.dcm}']`)
      const web3Link = container.querySelector(`a[href='${content.externalLinks.web3}']`)
      expect(dcmLink).toBeInTheDocument()
      expect(web3Link).toBeInTheDocument()
    })
  })
})
