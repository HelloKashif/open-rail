// Main track generator for HO scale model railroad
// Combines rails and ties into a complete track section

import type { TrackConfig } from "../types"
import { RAIL_SPECS, COLORS } from "../constants"
import { generateRailProfilePoints, createRail } from "./rail-profile"
import { createTies } from "./tie-generator"

/**
 * Generate a complete track section with two rails and ties
 */
export function generateTrack(
  jscad: {
    primitives: { polygon: Function; cuboid: Function }
    extrusions: { extrudeLinear: Function }
    transforms: { rotateX: Function; translate: Function }
    booleans: { union: Function }
    colors: { colorize: Function }
    utils: { degToRad: Function }
  },
  config: TrackConfig
) {
  const spec = RAIL_SPECS[config.railCode]

  // Generate rail profile points
  const profilePoints = generateRailProfilePoints(
    spec,
    config.filletRadius,
    config.filletSegments
  )

  // Calculate center-to-center distance for correct gauge
  // Gauge is measured between inner edges of heads
  const centerToCenter = config.trackGauge + spec.headWidth

  // Create left and right rails
  const leftRailBase = createRail(
    jscad,
    profilePoints,
    config.trackLength,
    COLORS.rail
  )
  const rightRailBase = createRail(
    jscad,
    profilePoints,
    config.trackLength,
    COLORS.rail
  )

  // Position rails
  const { translate } = jscad.transforms
  const leftRail = translate([-centerToCenter / 2, 0, 0], leftRailBase)
  const rightRail = translate([centerToCenter / 2, 0, 0], rightRailBase)

  // Build result array
  const solids = []

  // Add ties if enabled
  if (config.showTies) {
    const ties = createTies(jscad, config, COLORS.tie)
    solids.push(ties)

    // Raise rails to sit on top of ties
    const railZ = config.tieHeight
    const raisedLeft = translate([0, 0, railZ], leftRail)
    const raisedRight = translate([0, 0, railZ], rightRail)
    solids.push(raisedLeft, raisedRight)
  } else {
    // Rails at Z=0 if no ties
    solids.push(leftRail, rightRail)
  }

  return solids
}

/**
 * Convert JSCAD geometry to Three.js compatible data
 * Returns vertices, normals, and colors for BufferGeometry
 */
export function jscadToThreeData(
  jscad: { geometries: { geom3: { toPolygons: Function } } },
  solid: unknown
): {
  vertices: number[]
  normals: number[]
  colors: number[]
} {
  const { toPolygons } = jscad.geometries.geom3
  const polygons = toPolygons(solid)

  const vertices: number[] = []
  const normals: number[] = []
  const colors: number[] = []

  // Get color from solid if available
  const solidColor = (solid as { color?: [number, number, number] }).color || [
    0.5, 0.5, 0.8,
  ]

  for (const polygon of polygons as { vertices: number[][] }[]) {
    const verts = polygon.vertices

    // Fan triangulation
    for (let i = 1; i < verts.length - 1; i++) {
      const v0 = verts[0]
      const v1 = verts[i]
      const v2 = verts[i + 1]

      vertices.push(v0[0], v0[1], v0[2])
      vertices.push(v1[0], v1[1], v1[2])
      vertices.push(v2[0], v2[1], v2[2])

      // Calculate face normal via cross product
      const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
      const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]
      const normal = [
        edge1[1] * edge2[2] - edge1[2] * edge2[1],
        edge1[2] * edge2[0] - edge1[0] * edge2[2],
        edge1[0] * edge2[1] - edge1[1] * edge2[0],
      ]
      const len = Math.sqrt(
        normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2
      )

      for (let j = 0; j < 3; j++) {
        normals.push(normal[0] / len, normal[1] / len, normal[2] / len)
        colors.push(solidColor[0], solidColor[1], solidColor[2])
      }
    }
  }

  return { vertices, normals, colors }
}
