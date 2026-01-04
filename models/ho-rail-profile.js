// HO Scale Rail Profile Generator
// Scale: 1:87 (HO)
//
// Rail codes refer to height in thousandths of an inch:
// - Code 100: 2.54mm (0.100")
// - Code 83: 2.11mm (0.083") - most popular
// - Code 70: 1.78mm (0.070")

// ============================================
// PARAMETERS - Adjust these!
// ============================================

const railCode = 83;  // 100, 83, or 70
const railLength = 100; // Length of rail section in mm

// Rail dimensions based on code (in mm)
// These are approximate HO scale dimensions
const railSpecs = {
  100: {
    height: 2.54,
    headWidth: 1.8,
    headHeight: 0.7,
    webThickness: 0.5,
    baseWidth: 3.0,
    baseHeight: 0.6
  },
  83: {
    height: 2.11,
    headWidth: 1.5,
    headHeight: 0.6,
    webThickness: 0.4,
    baseWidth: 2.5,
    baseHeight: 0.5
  },
  70: {
    height: 1.78,
    headWidth: 1.3,
    headHeight: 0.5,
    webThickness: 0.35,
    baseWidth: 2.1,
    baseHeight: 0.45
  }
};

const spec = railSpecs[railCode];

// ============================================
// CREATE RAIL PROFILE (2D cross-section)
// ============================================

// The rail profile is an I-beam shape:
//     ___________
//    |   HEAD    |  <- where wheel contacts
//    |___________|
//         |
//         | WEB
//         |
//    _____|_____
//   |   BASE    |  <- sits on ties
//   |___________|

// Create the profile using polygon points
// Starting from bottom-left, going clockwise
const halfHead = spec.headWidth / 2;
const halfWeb = spec.webThickness / 2;
const halfBase = spec.baseWidth / 2;

const webHeight = spec.height - spec.headHeight - spec.baseHeight;

const profilePoints = [
  // Base (bottom)
  [-halfBase, 0],
  [halfBase, 0],
  [halfBase, spec.baseHeight],

  // Transition from base to web (right side)
  [halfWeb, spec.baseHeight],

  // Web (right side going up)
  [halfWeb, spec.baseHeight + webHeight],

  // Transition from web to head (right side)
  [halfHead, spec.baseHeight + webHeight],

  // Head (top)
  [halfHead, spec.height],
  [-halfHead, spec.height],

  // Transition from head to web (left side)
  [-halfHead, spec.baseHeight + webHeight],

  // Web (left side going down)
  [-halfWeb, spec.baseHeight + webHeight],

  // Transition from web to base (left side)
  [-halfWeb, spec.baseHeight],

  // Back to base (left side)
  [-halfBase, spec.baseHeight],
];

// Create 2D profile
const railProfile2D = polygon({ points: profilePoints });

// Extrude to create 3D rail
const rail = extrudeLinear(
  { height: railLength },
  railProfile2D
);

// Position so it sits on the XY plane with length along Y axis
const positionedRail = translate(
  [0, 0, 0],
  rotateX(degToRad(90), rail)
);

// Color it steel gray
return colorize([0.45, 0.45, 0.48], positionedRail);
