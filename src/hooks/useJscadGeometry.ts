"use client"

// Hook for generating JSCAD geometry from track configuration

import { useState, useEffect, useRef, useCallback } from "react"
import type { TrackConfig } from "@/lib/types"

// JSCAD module type (loaded dynamically)
type JscadModule = {
  primitives: { polygon: Function; cuboid: Function }
  extrusions: { extrudeLinear: Function }
  transforms: { rotateX: Function; translate: Function }
  booleans: { union: Function }
  colors: { colorize: Function }
  utils: { degToRad: Function }
  geometries: { geom3: { toPolygons: Function } }
}

// Cache for JSCAD module
let jscadModule: JscadModule | null = null

async function loadJscad(): Promise<JscadModule> {
  if (jscadModule) return jscadModule

  // Dynamic import of JSCAD
  const modeling = await import("@jscad/modeling")

  jscadModule = {
    primitives: modeling.primitives,
    extrusions: modeling.extrusions,
    transforms: modeling.transforms,
    booleans: modeling.booleans,
    colors: modeling.colors,
    utils: modeling.utils,
    geometries: modeling.geometries,
  }

  return jscadModule
}

interface GeometryResult {
  solids: unknown[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for generating JSCAD geometry from track configuration
 * Debounces updates to prevent excessive re-renders during slider drag
 */
export function useJscadGeometry(
  config: TrackConfig,
  debounceMs = 100
): GeometryResult {
  const [solids, setSolids] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const configRef = useRef(config)

  // Update ref when config changes
  configRef.current = config

  const generateGeometry = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const jscad = await loadJscad()

      // Import track generator dynamically to avoid SSR issues
      const { generateTrack } = await import("@/lib/jscad/track-generator")

      const result = generateTrack(jscad, configRef.current)
      setSolids(result)

      console.log("[open-rail] Geometry generated:", result.length, "solids")
    } catch (err) {
      console.error("[open-rail] Geometry generation error:", err)
      setError(err instanceof Error ? err : new Error("Generation failed"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the geometry generation
    timeoutRef.current = setTimeout(() => {
      generateGeometry()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [config, debounceMs, generateGeometry])

  return { solids, isLoading, error }
}

/**
 * Get the cached JSCAD module (for use in STL export)
 */
export function getJscadModule(): JscadModule | null {
  return jscadModule
}
