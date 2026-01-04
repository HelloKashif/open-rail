// Rail profile generator for HO scale tracks
// Creates an I-beam shaped rail cross-section with filleted head

import type { RailSpec } from "../types"

/**
 * Generate fillet arc points for rounded corners
 */
function filletArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments)
    points.push([
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle),
    ])
  }
  return points
}

/**
 * Generate 2D rail profile points for a given rail specification
 * The profile is an I-beam shape with filleted top corners:
 *
 *     ___________
 *    (   HEAD    )  <- filleted corners
 *    |___________|
 *         |
 *         | WEB
 *         |
 *    _____|_____
 *   |   BASE    |
 *   |___________|
 */
export function generateRailProfilePoints(
  spec: RailSpec,
  filletRadius: number,
  filletSegments: number
): [number, number][] {
  const halfHead = spec.headWidth / 2
  const halfWeb = spec.webThickness / 2
  const halfBase = spec.baseWidth / 2
  const webHeight = spec.height - spec.headHeight - spec.baseHeight

  // Clamp fillet radius to not exceed head height
  const actualFilletRadius = Math.min(filletRadius, spec.headHeight * 0.8)

  // Right fillet (top-right corner)
  const rightFilletCenter: [number, number] = [
    halfHead - actualFilletRadius,
    spec.height - actualFilletRadius,
  ]
  const rightFillet = filletArc(
    rightFilletCenter[0],
    rightFilletCenter[1],
    actualFilletRadius,
    0,
    Math.PI / 2,
    filletSegments
  )

  // Left fillet (top-left corner)
  const leftFilletCenter: [number, number] = [
    -halfHead + actualFilletRadius,
    spec.height - actualFilletRadius,
  ]
  const leftFillet = filletArc(
    leftFilletCenter[0],
    leftFilletCenter[1],
    actualFilletRadius,
    Math.PI / 2,
    Math.PI,
    filletSegments
  )

  // Build profile points clockwise from bottom-left
  const points: [number, number][] = [
    // Base
    [-halfBase, 0],
    [halfBase, 0],
    [halfBase, spec.baseHeight],
    // Right side up to web
    [halfWeb, spec.baseHeight],
    [halfWeb, spec.baseHeight + webHeight],
    // Right side of head
    [halfHead, spec.baseHeight + webHeight],
    [halfHead, spec.height - actualFilletRadius],
    // Right fillet (curved top-right)
    ...rightFillet,
    // Left fillet (curved top-left)
    ...leftFillet,
    // Left side of head
    [-halfHead, spec.height - actualFilletRadius],
    [-halfHead, spec.baseHeight + webHeight],
    // Left side down to web
    [-halfWeb, spec.baseHeight + webHeight],
    [-halfWeb, spec.baseHeight],
    // Back to base
    [-halfBase, spec.baseHeight],
  ]

  return points
}

/**
 * Create a single 3D rail from a 2D profile
 * Uses JSCAD primitives passed as parameters to avoid import issues
 */
export function createRail(
  jscad: {
    primitives: { polygon: Function }
    extrusions: { extrudeLinear: Function }
    transforms: { rotateX: Function; translate: Function }
    colors: { colorize: Function }
    utils: { degToRad: Function }
  },
  profilePoints: [number, number][],
  length: number,
  color: [number, number, number]
) {
  const { polygon } = jscad.primitives
  const { extrudeLinear } = jscad.extrusions
  const { rotateX, translate } = jscad.transforms
  const { colorize } = jscad.colors
  const { degToRad } = jscad.utils

  // Create 2D profile
  const profile2D = polygon({ points: profilePoints })

  // Extrude along Z axis
  const extruded = extrudeLinear({ height: length }, profile2D)

  // Rotate so rail lies in XY plane with length along Y axis
  const rotated = rotateX(degToRad(-90), extruded)

  // Translate to center
  const positioned = translate([0, length / 2, 0], rotated)

  // Apply color
  return colorize(color, positioned)
}
