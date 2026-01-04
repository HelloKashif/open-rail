// Tie (sleeper) generator for HO scale tracks

import type { TrackConfig } from "../types"

/**
 * Generate railroad ties distributed along the track
 */
export function createTies(
  jscad: {
    primitives: { cuboid: Function }
    transforms: { translate: Function }
    booleans: { union: Function }
    colors: { colorize: Function }
  },
  config: TrackConfig,
  color: [number, number, number]
) {
  const { cuboid } = jscad.primitives
  const { translate } = jscad.transforms
  const { union } = jscad.booleans
  const { colorize } = jscad.colors

  // Create a single tie centered at origin
  const singleTie = cuboid({
    size: [config.tieLength, config.tieWidth, config.tieHeight],
    center: [0, 0, config.tieHeight / 2], // Sit on Z=0
  })

  // Calculate number of ties needed
  const numTies = Math.floor(config.trackLength / config.tieSpacing)

  // Generate ties along the track
  const ties = []
  for (let i = 0; i <= numTies; i++) {
    const yPos = i * config.tieSpacing
    const tie = translate([0, yPos, 0], singleTie)
    ties.push(tie)
  }

  // Combine all ties
  if (ties.length === 0) {
    return colorize(color, singleTie)
  }

  if (ties.length === 1) {
    return colorize(color, ties[0])
  }

  const allTies = union(...ties)
  return colorize(color, allTies)
}
