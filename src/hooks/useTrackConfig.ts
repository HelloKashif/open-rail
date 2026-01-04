"use client"

// Zustand store for track configuration state

import { create } from "zustand"
import type { TrackConfig, RailCode } from "@/lib/types"
import { DEFAULT_CONFIG, RAIL_SPECS } from "@/lib/constants"

interface TrackStore {
  config: TrackConfig
  setRailCode: (code: RailCode) => void
  setTrackLength: (length: number) => void
  setTrackGauge: (gauge: number) => void
  setTieSpacing: (spacing: number) => void
  setTieDimensions: (length: number, width: number, height: number) => void
  setShowTies: (show: boolean) => void
  setFilletRadius: (radius: number) => void
  resetToDefaults: () => void
}

export const useTrackConfig = create<TrackStore>((set) => ({
  config: DEFAULT_CONFIG,

  setRailCode: (code) =>
    set((state) => {
      // Update fillet radius based on new rail code
      const spec = RAIL_SPECS[code]
      const newFilletRadius = spec.headHeight * 0.5
      return {
        config: {
          ...state.config,
          railCode: code,
          filletRadius: newFilletRadius,
        },
      }
    }),

  setTrackLength: (length) =>
    set((state) => ({
      config: { ...state.config, trackLength: length },
    })),

  setTrackGauge: (gauge) =>
    set((state) => ({
      config: { ...state.config, trackGauge: gauge },
    })),

  setTieSpacing: (spacing) =>
    set((state) => ({
      config: { ...state.config, tieSpacing: spacing },
    })),

  setTieDimensions: (length, width, height) =>
    set((state) => ({
      config: {
        ...state.config,
        tieLength: length,
        tieWidth: width,
        tieHeight: height,
      },
    })),

  setShowTies: (show) =>
    set((state) => ({
      config: { ...state.config, showTies: show },
    })),

  setFilletRadius: (radius) =>
    set((state) => ({
      config: { ...state.config, filletRadius: radius },
    })),

  resetToDefaults: () => set({ config: DEFAULT_CONFIG }),
}))
