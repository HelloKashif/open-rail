// Rail specifications and default values for Open-Rail
// HO Scale: 1:87

import type { RailCode, RailSpec, TrackConfig } from "./types"

// Rail specifications by code number
// Code numbers represent rail height in thousandths of an inch
export const RAIL_SPECS: Record<RailCode, RailSpec> = {
  100: {
    height: 2.54,        // 0.100" = 2.54mm
    headWidth: 1.8,
    headHeight: 0.7,
    webThickness: 0.5,
    baseWidth: 3.0,
    baseHeight: 0.6,
  },
  83: {
    height: 2.11,        // 0.083" = 2.11mm
    headWidth: 1.5,
    headHeight: 0.6,
    webThickness: 0.4,
    baseWidth: 2.5,
    baseHeight: 0.5,
  },
  70: {
    height: 1.78,        // 0.070" = 1.78mm
    headWidth: 1.3,
    headHeight: 0.5,
    webThickness: 0.35,
    baseWidth: 2.1,
    baseHeight: 0.45,
  },
}

// HO Scale track gauge
// Real standard gauge: 1435mm (4' 8.5")
// HO scale (1:87): 16.5mm
export const HO_GAUGE = 16.5

// Default tie (sleeper) dimensions at HO scale
// Real ties: ~2590mm long, 178mm wide, 152mm tall
// At 1:87 scale:
export const DEFAULT_TIE = {
  length: 30,      // mm (across track)
  width: 2.0,      // mm (along track)
  height: 1.7,     // mm (thickness)
  spacing: 13,     // mm center-to-center (prototype ~21" = 533mm)
}

// Default track configuration
export const DEFAULT_CONFIG: TrackConfig = {
  railCode: 100,
  trackLength: 50,
  trackGauge: HO_GAUGE,
  tieLength: DEFAULT_TIE.length,
  tieWidth: DEFAULT_TIE.width,
  tieHeight: DEFAULT_TIE.height,
  tieSpacing: DEFAULT_TIE.spacing,
  showTies: true,
  filletRadius: 0.35,  // 50% of head height for code 100
  filletSegments: 6,
}

// Colors for rendering
export const COLORS = {
  rail: [0.45, 0.45, 0.48] as [number, number, number],   // Steel gray
  tie: [0.4, 0.26, 0.13] as [number, number, number],    // Wood brown
}

// Track length constraints
export const TRACK_LENGTH = {
  min: 10,
  max: 500,
  step: 1,
}

// Tie spacing constraints
export const TIE_SPACING = {
  min: 5,
  max: 30,
  step: 0.5,
}
