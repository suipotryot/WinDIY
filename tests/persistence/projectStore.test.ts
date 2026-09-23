import { describe, expect, it } from 'vitest'
import { fixtureVoidOpeningTree, fixtureWindowParams } from '../../src/domain/fixtures'
import type { WindowProject } from '../../src/domain/types'
import {
  createProject,
  deleteProject,
  duplicateProject,
  exportProjectToJson,
  getProject,
  importProject,
  importProjectFromJson,
  listProjects,
  renameProject,
  updateProjectParams,
} from '../../src/persistence/projectStore'
import { createInMemoryStorage } from './inMemoryStorage'

describe('createProject', () => {
  it('should create a project with the given name and params', () => {
    const storage = createInMemoryStorage()

    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    expect(project.name).toBe('Fenêtre cuisine')
    expect(project.params).toEqual(fixtureWindowParams)
  })

  it('should assign a unique id to each created project', () => {
    const storage = createInMemoryStorage()

    const first = createProject('Fenêtre cuisine', fixtureWindowParams, storage)
    const second = createProject('Fenêtre salon', fixtureWindowParams, storage)

    expect(first.id).not.toBe(second.id)
  })
})

describe('listProjects', () => {
  it('should return an empty array when no project has been created', () => {
    const storage = createInMemoryStorage()

    expect(listProjects(storage)).toEqual([])
  })

  it('should return every project that has been created', () => {
    const storage = createInMemoryStorage()
    const first = createProject('Fenêtre cuisine', fixtureWindowParams, storage)
    const second = createProject('Fenêtre salon', fixtureWindowParams, storage)

    expect(listProjects(storage)).toEqual([first, second])
  })
})

describe('getProject', () => {
  it('should return the project matching the given id', () => {
    const storage = createInMemoryStorage()
    createProject('Fenêtre cuisine', fixtureWindowParams, storage)
    const target = createProject('Fenêtre salon', fixtureWindowParams, storage)

    expect(getProject(target.id, storage)).toEqual(target)
  })

  it('should return undefined when no project matches the given id', () => {
    const storage = createInMemoryStorage()

    expect(getProject('unknown-id', storage)).toBeUndefined()
  })
})

describe('renameProject', () => {
  it('should update the name of the matching project', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    const renamed = renameProject(project.id, 'Fenêtre salle à manger', storage)

    expect(renamed.name).toBe('Fenêtre salle à manger')
    expect(getProject(project.id, storage)?.name).toBe('Fenêtre salle à manger')
  })

  it('should throw when the project does not exist', () => {
    const storage = createInMemoryStorage()

    expect(() => renameProject('unknown-id', 'Nouveau nom', storage)).toThrow()
  })
})

describe('updateProjectParams', () => {
  it('should update the params of the matching project', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)
    const updatedParams = { ...fixtureWindowParams, reference: 'FEN-002' }

    const updated = updateProjectParams(project.id, updatedParams, storage)

    expect(updated.params).toEqual(updatedParams)
    expect(getProject(project.id, storage)?.params).toEqual(updatedParams)
  })

  it('should throw when the project does not exist', () => {
    const storage = createInMemoryStorage()

    expect(() => updateProjectParams('unknown-id', fixtureWindowParams, storage)).toThrow()
  })
})

describe('duplicateProject', () => {
  it('should create a copy of the project with a new id', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    const duplicate = duplicateProject(project.id, storage)

    expect(duplicate.id).not.toBe(project.id)
    expect(duplicate.params).toEqual(project.params)
  })

  it("should append a copy suffix to the duplicated project's name", () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    const duplicate = duplicateProject(project.id, storage)

    expect(duplicate.name).toBe('Fenêtre cuisine (copy)')
  })

  it('should duplicate the tree when the original project has one', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)
    const withTree: WindowProject = { ...project, tree: fixtureVoidOpeningTree }
    storage.setItem('windiy.projects', JSON.stringify([withTree]))

    const duplicate = duplicateProject(project.id, storage)

    expect(duplicate.tree).toEqual(fixtureVoidOpeningTree)
  })

  it('should throw when the project does not exist', () => {
    const storage = createInMemoryStorage()

    expect(() => duplicateProject('unknown-id', storage)).toThrow()
  })
})

describe('deleteProject', () => {
  it('should remove the matching project', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    deleteProject(project.id, storage)

    expect(listProjects(storage)).toEqual([])
  })

  it('should do nothing when the project does not exist', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    deleteProject('unknown-id', storage)

    expect(listProjects(storage)).toEqual([project])
  })
})

describe('exportProjectToJson', () => {
  it('should serialize a project into a JSON string', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    expect(JSON.parse(exportProjectToJson(project))).toEqual(project)
  })
})

describe('importProjectFromJson', () => {
  it('should parse a previously exported JSON string back into an equivalent project', () => {
    const storage = createInMemoryStorage()
    const project = createProject('Fenêtre cuisine', fixtureWindowParams, storage)

    expect(importProjectFromJson(exportProjectToJson(project))).toEqual(project)
  })

  it('should throw when the JSON is malformed', () => {
    expect(() => importProjectFromJson('{not valid json')).toThrow()
  })

  it('should throw when the parsed JSON is missing required project fields', () => {
    expect(() => importProjectFromJson(JSON.stringify({ id: 'only-an-id' }))).toThrow()
  })
})

describe('importProject', () => {
  it('should persist the imported project under a new id', () => {
    const sourceStorage = createInMemoryStorage()
    const source = createProject('Fenêtre cuisine', fixtureWindowParams, sourceStorage)
    const json = exportProjectToJson(source)

    const destinationStorage = createInMemoryStorage()
    const imported = importProject(json, destinationStorage)

    expect(imported.id).not.toBe(source.id)
    expect(imported.name).toBe(source.name)
    expect(listProjects(destinationStorage)).toEqual([imported])
  })
})
