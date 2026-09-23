import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultWindowParams } from '../../src/domain/defaultWindowParams'
import { ProjectBar } from '../../src/ui/ProjectBar'
import { useAppStore } from '../../src/ui/store'

beforeEach(() => {
  localStorage.clear()
  useAppStore.getState().refreshProjects()
  useAppStore.setState({ currentProjectId: null })
})

describe('ProjectBar', () => {
  it('should list every saved project', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    useAppStore.getState().createNewProject('Fenêtre salon', defaultWindowParams)

    render(<ProjectBar />)

    expect(screen.getByText('Fenêtre cuisine')).toBeInTheDocument()
    expect(screen.getByText('Fenêtre salon')).toBeInTheDocument()
  })

  it('should select a project when clicking it in the list', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    useAppStore.getState().createNewProject('Fenêtre salon', defaultWindowParams)
    useAppStore.setState({ currentProjectId: null })
    const [kitchen] = useAppStore.getState().projects
    const user = userEvent.setup()

    render(<ProjectBar />)
    await user.click(screen.getByText('Fenêtre cuisine'))

    expect(useAppStore.getState().currentProjectId).toBe(kitchen.id)
  })

  it('should create a new project when clicking "Nouveau"', async () => {
    const user = userEvent.setup()

    render(<ProjectBar />)
    await user.click(screen.getByRole('button', { name: 'Nouveau' }))

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects).toHaveLength(1)
    expect(currentProjectId).toBe(projects[0].id)
  })

  it('should duplicate the current project when clicking "Dupliquer"', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const user = userEvent.setup()

    render(<ProjectBar />)
    await user.click(screen.getByRole('button', { name: 'Dupliquer' }))

    expect(useAppStore.getState().projects).toHaveLength(2)
  })

  it('should remove a project when clicking its "Supprimer" button', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const user = userEvent.setup()

    render(<ProjectBar />)
    await user.click(screen.getByRole('button', { name: 'Supprimer Fenêtre cuisine' }))

    expect(useAppStore.getState().projects).toEqual([])
  })

  it('should rename the current project when editing the name field', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const user = userEvent.setup()

    render(<ProjectBar />)
    const nameField = screen.getByLabelText('Nom du projet')
    await user.clear(nameField)
    await user.type(nameField, 'Fenêtre salle à manger')

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects.find((project) => project.id === currentProjectId)?.name).toBe(
      'Fenêtre salle à manger',
    )
  })

  it('should show an enabled export button once a project is selected', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)

    render(<ProjectBar />)

    expect(screen.getByRole('button', { name: 'Exporter' })).toBeEnabled()
  })

  it('should import a project from an uploaded JSON file', async () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', defaultWindowParams)
    const json = JSON.stringify(useAppStore.getState().projects[0])
    const file = new File([json], 'fenetre-cuisine.json', { type: 'application/json' })
    const user = userEvent.setup()

    render(<ProjectBar />)
    await user.upload(screen.getByLabelText('Importer un projet'), file)

    expect(await screen.findAllByText('Fenêtre cuisine')).toHaveLength(2)
  })
})
