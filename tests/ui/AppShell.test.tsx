import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from '../../src/ui/AppShell'

describe('AppShell', () => {
  it('should render the project bar and the params form placeholder', () => {
    render(<AppShell />)

    expect(screen.getByRole('button', { name: 'Nouveau' })).toBeInTheDocument()
    expect(screen.getByText(/sélectionne ou crée une fenêtre/i)).toBeInTheDocument()
  })
})
