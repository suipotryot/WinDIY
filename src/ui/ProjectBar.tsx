import { defaultWindowParams } from '../domain/defaultWindowParams'
import { downloadProjectAsJsonFile } from '../persistence/projectStore'
import { useAppStore } from './store'

export function ProjectBar() {
  const projects = useAppStore((state) => state.projects)
  const currentProjectId = useAppStore((state) => state.currentProjectId)
  const selectProject = useAppStore((state) => state.selectProject)
  const createNewProject = useAppStore((state) => state.createNewProject)
  const duplicateCurrentProject = useAppStore((state) => state.duplicateCurrentProject)
  const removeProject = useAppStore((state) => state.removeProject)
  const renameCurrentProject = useAppStore((state) => state.renameCurrentProject)
  const importProjectFromJsonText = useAppStore((state) => state.importProjectFromJsonText)

  const currentProject = projects.find((project) => project.id === currentProjectId)

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    file.text().then(importProjectFromJsonText)
    event.target.value = ''
  }

  return (
    <nav>
      {currentProject && (
        <label>
          Nom du projet
          <input
            type="text"
            value={currentProject.name}
            onChange={(event) => renameCurrentProject(event.target.value)}
          />
        </label>
      )}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <button type="button" onClick={() => selectProject(project.id)}>
              {project.name}
            </button>
            <button type="button" aria-label={`Supprimer ${project.name}`} onClick={() => removeProject(project.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => createNewProject('Nouvelle fenêtre', defaultWindowParams)}>
        Nouveau
      </button>
      <button type="button" disabled={!currentProjectId} onClick={duplicateCurrentProject}>
        Dupliquer
      </button>
      <button
        type="button"
        disabled={!currentProject}
        onClick={() => currentProject && downloadProjectAsJsonFile(currentProject)}
      >
        Exporter
      </button>
      <label>
        Importer un projet
        <input type="file" accept="application/json" onChange={handleImport} />
      </label>
    </nav>
  )
}
