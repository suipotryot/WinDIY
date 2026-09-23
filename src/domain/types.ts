export interface Rabbet { // Batée
  thickness: number // épaisseur
  width: number // largeur
}

export interface WeatherSeal { // Joint
  grooveWidth: number // épaisseur de la rainure
  grooveDepth: number // profondeur de la rainure
}

export interface Tolerances { // Détails (jeux de fabrication)
  glazingClearance: number // jeu vitrage/bois
  glazingThickness: number // épaisseur du vitrage
  sashClearance: number // jeu ouvrant/dormant
}

export interface RoughOpening { // Tableau
  width: number // largeur du tableau
  height: number // hauteur du tableau
}

export interface Installation { // Pose
  roughOpening: RoughOpening // tableau
  setback: number // cochonnet
}

export interface WindowParams {
  reference: string // référence
  installation: Installation // pose (tableau + cochonnet)
  woodThickness: number // épaisseur bois (partagée dormant/ouvrant)
  sashWoodWidth: number // largeur bois (ouvrant)
  frameWoodWidth: number // largeur bois (dormant)
  rabbet: Rabbet // batée
  weatherSeal: WeatherSeal // joint
  tolerances: Tolerances // jeux de fabrication
}

export type SplitOrientation = 'vertical' | 'horizontal'

interface VoidOpeningRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface VoidOpeningLeaf extends VoidOpeningRect {
  kind: 'leaf'
  infill: InfillState
}

export interface VoidOpeningSplitNode extends VoidOpeningRect {
  kind: 'split'
  orientation: SplitOrientation
  children: [VoidOpeningNode, VoidOpeningNode]
}

export type VoidOpeningNode = VoidOpeningLeaf | VoidOpeningSplitNode // OuvertureVide

export type OpeningType = 'casement' | 'tiltAndTurn' // battant | oscillo-battant

export type InfillState = // Remplissage
  | { type: 'fixedGlazing' } // vitrage fixe
  | { type: 'openingSash'; openingType: OpeningType } // ouvrant fenêtre
  | { type: 'solidPanel' } // panneau plein
  | { type: 'empty' } // vide

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Point2D {
  x: number
  y: number
}

export interface PartCrossSection {
  outline: Point2D[]
}

export type PartMaterial = // matériau
  | 'frameWood' // bois dormant
  | 'sashWood' // bois ouvrant
  | 'glazing' // vitrage
  | 'solidPanel' // panneau plein
  | 'placeholder' // vide (avant remplissage)

export interface PartDescriptor {
  id: string
  label: string
  material: PartMaterial
  profile: PartCrossSection
  length: number
  position: Vector3
  rotation: Vector3
}

export type BomLineProfileVariant = 'frame' | 'sash' | 'mullion' // dormant | ouvrant | meneau

export interface TimberBomLine {
  category: 'timber'
  profileVariant: BomLineProfileVariant
  lengths: number[]
}

export interface GlazingBomLine {
  category: 'glazing'
  width: number
  height: number
  thickness: number
}

export interface HardwareBomLine {
  category: 'hardware'
  description: string
  quantity: number
}

export type BomLine = TimberBomLine | GlazingBomLine | HardwareBomLine

export interface WindowProject {
  id: string
  name: string
  params: WindowParams
  tree?: VoidOpeningNode
}
