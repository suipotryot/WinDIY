import { beforeEach, describe, expect, it } from 'vitest'
import { fixtureWindowParams } from '../../src/domain/fixtures'
import { exportProjectToJson } from '../../src/persistence/projectStore'
import { useAppStore } from '../../src/ui/store'

beforeEach(() => {
  localStorage.clear()
  useAppStore.getState().refreshProjects()
})

describe('createNewProject', () => {
  it('should add the new project to the list and select it', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects).toHaveLength(1)
    expect(projects[0].name).toBe('Fenêtre cuisine')
    expect(currentProjectId).toBe(projects[0].id)
  })
})

describe('selectProject', () => {
  it('should set the current project id', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    useAppStore.getState().createNewProject('Fenêtre salon', fixtureWindowParams)
    const [first] = useAppStore.getState().projects

    useAppStore.getState().selectProject(first.id)

    expect(useAppStore.getState().currentProjectId).toBe(first.id)
  })
})

describe('renameCurrentProject', () => {
  it('should rename the currently selected project', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)

    useAppStore.getState().renameCurrentProject('Fenêtre salle à manger')

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects.find((project) => project.id === currentProjectId)?.name).toBe(
      'Fenêtre salle à manger',
    )
  })
})

describe('duplicateCurrentProject', () => {
  it('should add a duplicate of the currently selected project and select it', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    const original = useAppStore.getState().projects[0]

    useAppStore.getState().duplicateCurrentProject()

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects).toHaveLength(2)
    expect(currentProjectId).not.toBe(original.id)
    expect(projects.find((project) => project.id === currentProjectId)?.name).toBe(
      'Fenêtre cuisine (copy)',
    )
  })
})

describe('removeProject', () => {
  it('should remove the project from the list', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    const project = useAppStore.getState().projects[0]

    useAppStore.getState().removeProject(project.id)

    expect(useAppStore.getState().projects).toEqual([])
  })

  it('should clear the current selection when the removed project was selected', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    const project = useAppStore.getState().projects[0]

    useAppStore.getState().removeProject(project.id)

    expect(useAppStore.getState().currentProjectId).toBeNull()
  })
})

describe('updateCurrentParams', () => {
  it('should persist the updated params for the currently selected project', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    const updatedParams = { ...fixtureWindowParams, reference: 'FEN-002' }

    useAppStore.getState().updateCurrentParams(updatedParams)

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects.find((project) => project.id === currentProjectId)?.params).toEqual(
      updatedParams,
    )
  })
})

describe('importProjectFromJsonText', () => {
  it('should add the imported project to the list and select it', () => {
    useAppStore.getState().createNewProject('Fenêtre cuisine', fixtureWindowParams)
    const json = exportProjectToJson(useAppStore.getState().projects[0])

    useAppStore.getState().importProjectFromJsonText(json)

    const { projects, currentProjectId } = useAppStore.getState()
    expect(projects).toHaveLength(2)
    expect(projects.find((project) => project.id === currentProjectId)?.name).toBe(
      'Fenêtre cuisine',
    )
  })
})
