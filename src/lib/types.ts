// Track configuration types for Open-Rail

export type RailCode = 100 | 83 | 70

export interface RailSpec {
  height: number      // Total rail height in mm
  headWidth: number   // Width of rail head
  headHeight: number  // Height of rail head
  webThickness: number // Thickness of rail web
  baseWidth: number   // Width of rail base
  baseHeight: number  // Height of rail base
}

export interface TrackConfig {
  railCode: RailCode
  trackLength: number    // mm
  trackGauge: number     // mm (distance between inner edges of rail heads)
  tieLength: number      // mm
  tieWidth: number       // mm
  tieHeight: number      // mm
  tieSpacing: number     // mm (center-to-center)
  showTies: boolean
  filletRadius: number   // mm (for rail head curve)
  filletSegments: number // number of segments for fillet arc
}

export interface Point2D {
  x: number
  y: number
}

// JSCAD geometry types (simplified for our use)
export interface JscadSolid {
  polygons: unknown[]
  color?: [number, number, number]
}
