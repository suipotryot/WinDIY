import type { WindowParams } from '../domain/types'
import { useAppStore } from './store'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label>
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function WindowParamsForm() {
  const projects = useAppStore((state) => state.projects)
  const currentProjectId = useAppStore((state) => state.currentProjectId)
  const updateCurrentParams = useAppStore((state) => state.updateCurrentParams)

  const currentProject = projects.find((project) => project.id === currentProjectId)

  if (!currentProject) {
    return <p>Sélectionne ou crée une fenêtre pour commencer.</p>
  }

  const params = currentProject.params

  function update(patch: Partial<WindowParams>) {
    updateCurrentParams({ ...params, ...patch })
  }

  return (
    <form>
      <fieldset>
        <legend>Type</legend>
        <label>
          <input type="radio" name="windowType" checked readOnly />
          Fenêtre
        </label>
        <label>
          <input type="radio" name="windowType" disabled />
          Porte-fenêtre
        </label>
      </fieldset>

      <label>
        Référence
        <input
          type="text"
          value={params.reference}
          onChange={(event) => update({ reference: event.target.value })}
        />
      </label>

      <NumberField
        label="Cochonnet"
        value={params.installation.setback}
        onChange={(value) =>
          update({ installation: { ...params.installation, setback: value } })
        }
      />
      <NumberField
        label="Largeur tableau"
        value={params.installation.roughOpening.width}
        onChange={(value) =>
          update({
            installation: {
              ...params.installation,
              roughOpening: { ...params.installation.roughOpening, width: value },
            },
          })
        }
      />
      <NumberField
        label="Hauteur tableau"
        value={params.installation.roughOpening.height}
        onChange={(value) =>
          update({
            installation: {
              ...params.installation,
              roughOpening: { ...params.installation.roughOpening, height: value },
            },
          })
        }
      />

      <NumberField
        label="Épaisseur bois"
        value={params.woodThickness}
        onChange={(value) => update({ woodThickness: value })}
      />
      <NumberField
        label="Largeur bois (ouvrant)"
        value={params.sashWoodWidth}
        onChange={(value) => update({ sashWoodWidth: value })}
      />
      <NumberField
        label="Largeur bois (dormant)"
        value={params.frameWoodWidth}
        onChange={(value) => update({ frameWoodWidth: value })}
      />

      <NumberField
        label="Épaisseur batée"
        value={params.rabbet.thickness}
        onChange={(value) => update({ rabbet: { ...params.rabbet, thickness: value } })}
      />
      <NumberField
        label="Largeur batée"
        value={params.rabbet.width}
        onChange={(value) => update({ rabbet: { ...params.rabbet, width: value } })}
      />

      <NumberField
        label="Épaisseur rainure joint"
        value={params.weatherSeal.grooveWidth}
        onChange={(value) =>
          update({ weatherSeal: { ...params.weatherSeal, grooveWidth: value } })
        }
      />
      <NumberField
        label="Profondeur rainure joint"
        value={params.weatherSeal.grooveDepth}
        onChange={(value) =>
          update({ weatherSeal: { ...params.weatherSeal, grooveDepth: value } })
        }
      />

      <NumberField
        label="Jeu ouvrant/dormant"
        value={params.tolerances.sashClearance}
        onChange={(value) =>
          update({ tolerances: { ...params.tolerances, sashClearance: value } })
        }
      />
      <NumberField
        label="Épaisseur vitrage"
        value={params.tolerances.glazingThickness}
        onChange={(value) =>
          update({ tolerances: { ...params.tolerances, glazingThickness: value } })
        }
      />
      <NumberField
        label="Jeu vitrage/bois"
        value={params.tolerances.glazingClearance}
        onChange={(value) =>
          update({ tolerances: { ...params.tolerances, glazingClearance: value } })
        }
      />
    </form>
  )
}
