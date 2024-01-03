import { render, screen } from '@testing-library/react'
import LogInSection from './LogInSection'
import content from './LogInSection.content.json'

describe('LogInSection component', () => {
  test('renders title', () => {
    render(<LogInSection />)
    const title = screen.getByText(content.title)
    expect(title).toBeInTheDocument()
  })
  test('renders description', () => {
    render(<LogInSection />)
    const description = screen.getByText(content.description)
    expect(description).toBeInTheDocument()
  })
})
