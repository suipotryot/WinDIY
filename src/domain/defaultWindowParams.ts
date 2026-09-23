import type { WindowParams } from './types'

export const defaultWindowParams: WindowParams = {
  reference: '',
  installation: {
    roughOpening: { width: 850, height: 2000 },
    setback: 30,
  },
  woodThickness: 63,
  sashWoodWidth: 86,
  frameWoodWidth: 86,
  rabbet: { thickness: 45, width: 18 },
  weatherSeal: { grooveWidth: 3, grooveDepth: 6 },
  tolerances: { glazingClearance: 5, glazingThickness: 24, sashClearance: 3 },
}
