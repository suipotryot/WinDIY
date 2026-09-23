import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultWindowParams } from '../../src/domain/defaultWindowParams'
import { useAppStore } from '../../src/ui/store'
import { WindowParamsForm } from '../../src/ui/WindowParamsForm'

beforeEach(() => {
  localStorage.clear()
  useAppStore.getState().refreshProjects()
  useAppStore.setState({ currentProjectId: null })
})

describe('WindowParamsForm', () => {
  it('should show a placeholder when no project is selected', () => {
    render(<WindowParamsForm />)

    expect(screen.getByText(/sélectionne ou crée une fenêtre/i)).toBeInTheDocument()
  })

  it('should render an input for each of the 14 window parameters', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)

    render(<WindowParamsForm />)

    const labels = [
      'Cochonnet',
      'Épaisseur bois',
      'Largeur bois (ouvrant)',
      'Largeur bois (dormant)',
      'Épaisseur batée',
      'Largeur batée',
      'Épaisseur rainure joint',
      'Profondeur rainure joint',
      'Jeu ouvrant/dormant',
      'Épaisseur vitrage',
      'Jeu vitrage/bois',
      'Référence',
      'Largeur tableau',
      'Hauteur tableau',
    ]
    for (const label of labels) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it("should display the current project's values", () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)

    render(<WindowParamsForm />)

    expect(screen.getByLabelText('Cochonnet')).toHaveValue(defaultWindowParams.installation.setback)
    expect(screen.getByLabelText('Largeur tableau')).toHaveValue(
      defaultWindowParams.installation.roughOpening.width,
    )
  })

  it('should update the store when the reference field changes', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const user = userEvent.setup()

    render(<WindowParamsForm />)
    await user.type(screen.getByLabelText('Référence'), 'FEN-002')

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects.find((project) => project.id === currentProjectId)?.params.reference).toBe(
      'FEN-002',
    )
  })

  it('should update the store when the setback field changes', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const user = userEvent.setup()

    render(<WindowParamsForm />)
    const cochonnet = screen.getByLabelText('Cochonnet')
    await user.clear(cochonnet)
    await user.type(cochonnet, '25')

    const { projects, currentProjectId } = useAppStore.getState()
    expect(
      projects.find((project) => project.id === currentProjectId)?.params.installation.setback,
    ).toBe(25)
  })
})
