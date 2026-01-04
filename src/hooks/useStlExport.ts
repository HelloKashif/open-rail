"use client"

// Hook for exporting track geometry to STL file

import { useCallback, useState } from "react"
import * as THREE from "three"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js"
import { getJscadModule } from "./useJscadGeometry"
import { jscadToThreeData } from "@/lib/jscad/track-generator"

interface ExportState {
  isExporting: boolean
  error: Error | null
}

/**
 * Hook for exporting JSCAD solids to STL file
 */
export function useStlExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
  })

  const exportToStl = useCallback(
    async (solids: unknown[], filename = "track.stl") => {
      if (solids.length === 0) {
        setState({ isExporting: false, error: new Error("No geometry to export") })
        return
      }

      setState({ isExporting: true, error: null })

      try {
        const jscad = getJscadModule()
        if (!jscad) {
          throw new Error("JSCAD module not loaded")
        }

        // Create Three.js scene with all solids
        const group = new THREE.Group()

        for (const solid of solids) {
          const { vertices, normals, colors } = jscadToThreeData(jscad, solid)

          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
          )
          geometry.setAttribute(
            "normal",
            new THREE.Float32BufferAttribute(normals, 3)
          )
          geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
          )

          const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
          })

          const mesh = new THREE.Mesh(geometry, material)
          group.add(mesh)
        }

        // Export to STL
        const exporter = new STLExporter()
        const stlData = exporter.parse(group, { binary: true })

        // Create download
        const blob = new Blob([stlData], { type: "application/octet-stream" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()

        URL.revokeObjectURL(url)

        console.log("[open-rail] Exported STL:", filename)
        setState({ isExporting: false, error: null })
      } catch (err) {
        console.error("[open-rail] STL export error:", err)
        setState({
          isExporting: false,
          error: err instanceof Error ? err : new Error("Export failed"),
        })
      }
    },
    []
  )

  return {
    exportToStl,
    isExporting: state.isExporting,
    exportError: state.error,
  }
}
