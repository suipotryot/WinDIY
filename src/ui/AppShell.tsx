import { FixturePreviewPanel } from './FixturePreviewPanel'
import { ProjectBar } from './ProjectBar'
import { WindowParamsForm } from './WindowParamsForm'

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__project-bar">
        <ProjectBar />
      </header>
      <div className="app-shell__body">
        <aside className="app-shell__left">
          <WindowParamsForm />
        </aside>
        <main className="app-shell__center">
          <FixturePreviewPanel />
        </main>
        <aside className="app-shell__right" />
      </div>
    </div>
  )
}
