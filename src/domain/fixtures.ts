import type {
  PartCrossSection,
  PartDescriptor,
  VoidOpeningNode,
  WindowParams,
  WindowProject,
} from './types'

export const fixtureWindowParams: WindowParams = {
  reference: 'FEN-001',
  installation: {
    roughOpening: { width: 1200, height: 1400 },
    setback: 30,
  },
  woodThickness: 63,
  sashWoodWidth: 86,
  frameWoodWidth: 86,
  rabbet: { thickness: 45, width: 18 },
  weatherSeal: { grooveWidth: 3, grooveDepth: 6 },
  tolerances: { glazingClearance: 5, glazingThickness: 24, sashClearance: 3 },
}

export const fixtureVoidOpeningTree: VoidOpeningNode = {
  kind: 'split',
  id: 'root',
  orientation: 'vertical',
  x: 0,
  y: 0,
  width: 1080,
  height: 1280,
  children: [
    {
      kind: 'leaf',
      id: 'left-fixed-glazing',
      x: 0,
      y: 0,
      width: 500,
      height: 1280,
      infill: { type: 'fixedGlazing' },
    },
    {
      kind: 'split',
      id: 'right-split',
      orientation: 'horizontal',
      x: 580,
      y: 0,
      width: 500,
      height: 1280,
      children: [
        {
          kind: 'leaf',
          id: 'right-top-sash',
          x: 580,
          y: 0,
          width: 500,
          height: 640,
          infill: { type: 'openingSash', openingType: 'tiltAndTurn' },
        },
        {
          kind: 'leaf',
          id: 'right-bottom-panel',
          x: 580,
          y: 640,
          width: 500,
          height: 640,
          infill: { type: 'solidPanel' },
        },
      ],
    },
  ],
}

function rectangleOutline(width: number, height: number): PartCrossSection {
  return {
    outline: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ],
  }
}

const frameProfile = rectangleOutline(fixtureWindowParams.frameWoodWidth, fixtureWindowParams.woodThickness)
const sashProfile = rectangleOutline(fixtureWindowParams.sashWoodWidth, fixtureWindowParams.woodThickness)
const glazingProfile = rectangleOutline(fixtureWindowParams.tolerances.glazingThickness, 100)
const panelProfile = rectangleOutline(fixtureWindowParams.tolerances.glazingThickness, 100)

export const fixtureParts: PartDescriptor[] = [
  {
    id: 'frame-top',
    label: 'Dormant - traverse haute',
    material: 'frameWood',
    profile: frameProfile,
    length: 1200,
    position: { x: 0, y: 0, z: 640 },
    rotation: { x: 0, y: 90, z: 0 },
  },
  {
    id: 'frame-bottom',
    label: 'Dormant - traverse basse',
    material: 'frameWood',
    profile: frameProfile,
    length: 1200,
    position: { x: 0, y: 0, z: -640 },
    rotation: { x: 0, y: 90, z: 0 },
  },
  {
    id: 'frame-left',
    label: 'Dormant - montant gauche',
    material: 'frameWood',
    profile: frameProfile,
    length: 1400,
    position: { x: -540, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'frame-right',
    label: 'Dormant - montant droit',
    material: 'frameWood',
    profile: frameProfile,
    length: 1400,
    position: { x: 540, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'mullion',
    label: 'Meneau',
    material: 'frameWood',
    profile: frameProfile,
    length: 1280,
    position: { x: 540, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'transom',
    label: 'Traverse intermédiaire',
    material: 'frameWood',
    profile: frameProfile,
    length: 500,
    position: { x: 580, y: 0, z: 0 },
    rotation: { x: 0, y: 90, z: 0 },
  },
  {
    id: 'sash-top',
    label: 'Ouvrant - traverse haute',
    material: 'sashWood',
    profile: sashProfile,
    length: 500,
    position: { x: 580, y: 0, z: 320 },
    rotation: { x: 0, y: 90, z: 0 },
  },
  {
    id: 'sash-bottom',
    label: 'Ouvrant - traverse basse',
    material: 'sashWood',
    profile: sashProfile,
    length: 500,
    position: { x: 580, y: 0, z: 0 },
    rotation: { x: 0, y: 90, z: 0 },
  },
  {
    id: 'sash-left',
    label: 'Ouvrant - montant gauche',
    material: 'sashWood',
    profile: sashProfile,
    length: 640,
    position: { x: 330, y: 0, z: 160 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'sash-right',
    label: 'Ouvrant - montant droit',
    material: 'sashWood',
    profile: sashProfile,
    length: 640,
    position: { x: 830, y: 0, z: 160 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'glazing-left',
    label: 'Vitrage fixe gauche',
    material: 'glazing',
    profile: glazingProfile,
    length: 1280,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'glazing-sash',
    label: 'Vitrage ouvrant',
    material: 'glazing',
    profile: glazingProfile,
    length: 640,
    position: { x: 580, y: 0, z: 320 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'panel-bottom',
    label: 'Panneau plein bas droit',
    material: 'solidPanel',
    profile: panelProfile,
    length: 640,
    position: { x: 580, y: 0, z: -320 },
    rotation: { x: 0, y: 0, z: 0 },
  },
]

export const fixtureWindowProject: WindowProject = {
  id: 'fixture-project',
  name: 'Fenêtre exemple',
  params: fixtureWindowParams,
  tree: fixtureVoidOpeningTree,
}
