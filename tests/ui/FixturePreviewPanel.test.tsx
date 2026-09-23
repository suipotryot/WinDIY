import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fixtureParts } from '../../src/domain/fixtures'
import { FixturePreviewPanel } from '../../src/ui/FixturePreviewPanel'

describe('FixturePreviewPanel', () => {
  it('should list the 3 zones of the example window', () => {
    render(<FixturePreviewPanel />)

    expect(screen.getByText('Vitrage fixe')).toBeInTheDocument()
    expect(screen.getByText('Ouvrant fenêtre')).toBeInTheDocument()
    expect(screen.getByText('Panneau plein')).toBeInTheDocument()
  })

  it('should list every part of the example window', () => {
    render(<FixturePreviewPanel />)

    for (const part of fixtureParts) {
      expect(screen.getByText(part.label)).toBeInTheDocument()
    }
  })
})
