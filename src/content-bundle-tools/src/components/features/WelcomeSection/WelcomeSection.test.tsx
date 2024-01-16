import { render, screen } from '@testing-library/react'
import WelcomeSection from '~/components/features/WelcomeSection/WelcomeSection'
import content from '~/components/features/WelcomeSection/WelcomeSection.content.json'
import { describe, expect, test } from 'vitest'

describe('WelcomeSection component', () => {
  test('renders title', () => {
    render(<WelcomeSection />)
    const title = screen.getByText(content.title)
    expect(title).toBeInTheDocument()
  })
  test('renders description', () => {
    render(<WelcomeSection />)
    const description = screen.getByText(content.description)
    expect(description).toBeInTheDocument()
  })
})
