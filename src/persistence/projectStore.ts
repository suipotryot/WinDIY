import type { WindowParams, WindowProject } from '../domain/types'

const STORAGE_KEY = 'windiy.projects'

function readAll(storage: Storage): WindowProject[] {
  const raw = storage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeAll(storage: Storage, projects: WindowProject[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function createProject(
  name: string,
  params: WindowParams,
  storage: Storage = window.localStorage,
): WindowProject {
  const project: WindowProject = {
    id: crypto.randomUUID(),
    name,
    params,
  }

  writeAll(storage, [...readAll(storage), project])

  return project
}

export function listProjects(storage: Storage = window.localStorage): WindowProject[] {
  return readAll(storage)
}

export function getProject(
  id: string,
  storage: Storage = window.localStorage,
): WindowProject | undefined {
  return readAll(storage).find((project) => project.id === id)
}

function requireProjectIndex(projects: WindowProject[], id: string): number {
  const index = projects.findIndex((project) => project.id === id)
  if (index === -1) {
    throw new Error(`No project found with id "${id}"`)
  }
  return index
}

export function renameProject(
  id: string,
  name: string,
  storage: Storage = window.localStorage,
): WindowProject {
  const projects = readAll(storage)
  const index = requireProjectIndex(projects, id)

  const renamed: WindowProject = { ...projects[index], name }
  projects[index] = renamed
  writeAll(storage, projects)

  return renamed
}

export function duplicateProject(
  id: string,
  storage: Storage = window.localStorage,
): WindowProject {
  const projects = readAll(storage)
  const index = requireProjectIndex(projects, id)

  const duplicate: WindowProject = {
    ...projects[index],
    id: crypto.randomUUID(),
    name: `${projects[index].name} (copy)`,
  }
  writeAll(storage, [...projects, duplicate])

  return duplicate
}

export function deleteProject(id: string, storage: Storage = window.localStorage): void {
  writeAll(storage, readAll(storage).filter((project) => project.id !== id))
}

export function exportProjectToJson(project: WindowProject): string {
  return JSON.stringify(project)
}

export function downloadProjectAsJsonFile(project: WindowProject): void {
  const blob = new Blob([exportProjectToJson(project)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name}.json`
  link.click()

  URL.revokeObjectURL(url)
}

export function importProjectFromJson(json: string): WindowProject {
  const parsed = JSON.parse(json)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof parsed.id !== 'string' ||
    typeof parsed.name !== 'string' ||
    typeof parsed.params !== 'object' ||
    parsed.params === null
  ) {
    throw new Error('Invalid WindowProject JSON')
  }

  return parsed as WindowProject
}

export function importProject(json: string, storage: Storage = window.localStorage): WindowProject {
  const imported: WindowProject = { ...importProjectFromJson(json), id: crypto.randomUUID() }
  writeAll(storage, [...readAll(storage), imported])

  return imported
}
