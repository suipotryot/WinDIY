import { create } from 'zustand'
import type { WindowParams, WindowProject } from '../domain/types'
import {
  createProject,
  deleteProject,
  duplicateProject,
  importProject,
  listProjects,
  renameProject,
  updateProjectParams,
} from '../persistence/projectStore'

interface AppState {
  projects: WindowProject[]
  currentProjectId: string | null
  refreshProjects: () => void
  createNewProject: (name: string, params: WindowParams) => void
  selectProject: (id: string) => void
  renameCurrentProject: (name: string) => void
  duplicateCurrentProject: () => void
  removeProject: (id: string) => void
  updateCurrentParams: (params: WindowParams) => void
  importProjectFromJsonText: (json: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  currentProjectId: null,

  refreshProjects: () => set({ projects: listProjects() }),

  createNewProject: (name, params) => {
    const project = createProject(name, params)
    set({ projects: listProjects(), currentProjectId: project.id })
  },

  selectProject: (id) => set({ currentProjectId: id }),

  renameCurrentProject: (name) => {
    const { currentProjectId } = get()
    if (!currentProjectId) return
    renameProject(currentProjectId, name)
    set({ projects: listProjects() })
  },

  duplicateCurrentProject: () => {
    const { currentProjectId } = get()
    if (!currentProjectId) return
    const duplicate = duplicateProject(currentProjectId)
    set({ projects: listProjects(), currentProjectId: duplicate.id })
  },

  removeProject: (id) => {
    deleteProject(id)
    set((state) => ({
      projects: listProjects(),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    }))
  },

  updateCurrentParams: (params) => {
    const { currentProjectId } = get()
    if (!currentProjectId) return
    updateProjectParams(currentProjectId, params)
    set({ projects: listProjects() })
  },

  importProjectFromJsonText: (json) => {
    const imported = importProject(json)
    set({ projects: listProjects(), currentProjectId: imported.id })
  },
}))
