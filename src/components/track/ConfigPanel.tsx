"use client"

// Configuration panel with form controls for track parameters

import { useTrackConfig } from "@/hooks/useTrackConfig"
import { RAIL_SPECS, TRACK_LENGTH, TIE_SPACING, HO_GAUGE } from "@/lib/constants"
import type { RailCode } from "@/lib/types"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ConfigPanel() {
  const {
    config,
    setRailCode,
    setTrackLength,
    setTieSpacing,
    setShowTies,
  } = useTrackConfig()

  return (
    <div className="space-y-6 p-4">
      {/* Rail Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-200">Rail Settings</h3>

        {/* Rail Code */}
        <div className="space-y-2">
          <Label htmlFor="rail-code">Rail Code</Label>
          <Select
            value={String(config.railCode)}
            onValueChange={(value) => setRailCode(Number(value) as RailCode)}
          >
            <SelectTrigger id="rail-code">
              <SelectValue placeholder="Select rail code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">
                Code 100 ({RAIL_SPECS[100].height}mm)
              </SelectItem>
              <SelectItem value="83">
                Code 83 ({RAIL_SPECS[83].height}mm)
              </SelectItem>
              <SelectItem value="70">
                Code 70 ({RAIL_SPECS[70].height}mm)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-500">
            Rail height in thousandths of an inch
          </p>
        </div>

        {/* Track Length */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="track-length">Track Length</Label>
            <span className="text-sm text-neutral-400">
              {config.trackLength}mm
            </span>
          </div>
          <Slider
            id="track-length"
            min={TRACK_LENGTH.min}
            max={TRACK_LENGTH.max}
            step={TRACK_LENGTH.step}
            value={[config.trackLength]}
            onValueChange={([value]) => setTrackLength(value)}
          />
        </div>

        {/* Track Gauge (read-only for now) */}
        <div className="space-y-2">
          <Label>Track Gauge</Label>
          <div className="text-sm text-neutral-300 bg-neutral-800 px-3 py-2 rounded-md">
            {HO_GAUGE}mm (HO Scale)
          </div>
          <p className="text-xs text-neutral-500">
            Standard HO scale gauge (1:87 of 1435mm)
          </p>
        </div>
      </div>

      <Separator className="bg-neutral-700" />

      {/* Tie Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-200">Ties (Sleepers)</h3>
          <Switch
            checked={config.showTies}
            onCheckedChange={setShowTies}
          />
        </div>

        {config.showTies && (
          <>
            {/* Tie Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="tie-spacing">Tie Spacing</Label>
                <span className="text-sm text-neutral-400">
                  {config.tieSpacing}mm
                </span>
              </div>
              <Slider
                id="tie-spacing"
                min={TIE_SPACING.min}
                max={TIE_SPACING.max}
                step={TIE_SPACING.step}
                value={[config.tieSpacing]}
                onValueChange={([value]) => setTieSpacing(value)}
              />
            </div>

            {/* Tie Dimensions (read-only summary) */}
            <div className="space-y-2">
              <Label>Tie Dimensions</Label>
              <div className="text-xs text-neutral-400 bg-neutral-800 px-3 py-2 rounded-md">
                {config.tieLength} × {config.tieWidth} × {config.tieHeight}mm
                (L × W × H)
              </div>
            </div>
          </>
        )}
      </div>

      <Separator className="bg-neutral-700" />

      {/* Info */}
      <div className="text-xs text-neutral-500 space-y-1">
        <p>HO Scale: 1:87</p>
        <p>Units: millimeters</p>
      </div>
    </div>
  )
}
