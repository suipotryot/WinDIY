import { fixtureParts, fixtureVoidOpeningTree } from '../domain/fixtures'
import type { InfillState, VoidOpeningNode } from '../domain/types'

function collectLeaves(node: VoidOpeningNode): VoidOpeningNode[] {
  return node.kind === 'leaf' ? [node] : node.children.flatMap(collectLeaves)
}

const infillLabels: Record<InfillState['type'], string> = {
  fixedGlazing: 'Vitrage fixe',
  openingSash: 'Ouvrant fenêtre',
  solidPanel: 'Panneau plein',
  empty: 'Vide',
}

export function FixturePreviewPanel() {
  const leaves = collectLeaves(fixtureVoidOpeningTree).filter(
    (leaf): leaf is Extract<VoidOpeningNode, { kind: 'leaf' }> => leaf.kind === 'leaf',
  )

  return (
    <section>
      <h2>Aperçu (exemple)</h2>
      <ul>
        {leaves.map((leaf) => (
          <li key={leaf.id}>{infillLabels[leaf.infill.type]}</li>
        ))}
      </ul>
      <ul>
        {fixtureParts.map((part) => (
          <li key={part.id}>{part.label}</li>
        ))}
      </ul>
    </section>
  )
}
