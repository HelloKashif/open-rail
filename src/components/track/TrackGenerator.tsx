"use client"

// Main track generator page component
// Combines config panel, 3D viewer, and export functionality

import dynamic from "next/dynamic"
import { Download, RotateCcw } from "lucide-react"

import { useTrackConfig } from "@/hooks/useTrackConfig"
import { useJscadGeometry } from "@/hooks/useJscadGeometry"
import { useStlExport } from "@/hooks/useStlExport"

import { ConfigPanel } from "./ConfigPanel"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Dynamic import for Three.js viewer (client-only)
const ThreeViewer = dynamic(
  () => import("@/components/viewer/ThreeViewer").then((mod) => mod.ThreeViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900">
        <div className="text-neutral-400">Loading 3D viewer...</div>
      </div>
    ),
  }
)

export function TrackGenerator() {
  const { config, resetToDefaults } = useTrackConfig()
  const { solids, isLoading, error } = useJscadGeometry(config)
  const { exportToStl, isExporting, exportError } = useStlExport()

  const handleExport = () => {
    const filename = `track-${config.railCode}-${config.trackLength}mm.stl`
    exportToStl(solids, filename)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <h1 className="text-lg font-bold text-neutral-100">Open Rail</h1>
          <p className="text-xs text-neutral-500">HO Scale Track Generator</p>
        </div>

        {/* Config Panel */}
        <div className="flex-1 overflow-y-auto">
          <ConfigPanel />
        </div>

        <Separator className="bg-neutral-800" />

        {/* Actions */}
        <div className="p-4 space-y-2">
          <Button
            onClick={handleExport}
            disabled={isLoading || isExporting || solids.length === 0}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Download STL"}
          </Button>

          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>

          {(error || exportError) && (
            <p className="text-xs text-red-400">
              {error?.message || exportError?.message}
            </p>
          )}
        </div>
      </aside>

      {/* Main viewer */}
      <main className="flex-1 min-h-[50vh] lg:min-h-0">
        <ThreeViewer solids={solids} isLoading={isLoading} />
      </main>
    </div>
  )
}
