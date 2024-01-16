import { fireEvent, render, screen } from '@testing-library/react'
import Button from './Button'
import { describe, expect, test, vi } from 'vitest'

describe('Button component', () => {
  // prettier-ignore
  const text = 'I\'m Button'
  test('Button renders text', () => {
    render(<Button>{text}</Button>)
    const button = screen.getByText(text)
    expect(button).toBeInTheDocument()
  })

  test('onClick working', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>{text}</Button>)
    const button = screen.getByText(text)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })
})
