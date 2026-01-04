"use client"

// Three.js 3D viewer for track preview

import { useEffect, useRef, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { getJscadModule } from "@/hooks/useJscadGeometry"
import { jscadToThreeData } from "@/lib/jscad/track-generator"

interface ThreeViewerProps {
  solids: unknown[]
  isLoading: boolean
}

export function ThreeViewer({ solids, isLoading }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const meshGroupRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000)
    camera.position.set(40, -60, 40)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-50, -50, -50)
    scene.add(directionalLight2)

    // Grid
    const gridHelper = new THREE.GridHelper(200, 40, 0x444466, 0x333355)
    gridHelper.rotation.x = Math.PI / 2
    scene.add(gridHelper)

    // Axes
    const axesHelper = new THREE.AxesHelper(30)
    scene.add(axesHelper)

    // Mesh group for track
    const meshGroup = new THREE.Group()
    scene.add(meshGroup)
    meshGroupRef.current = meshGroup

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    console.log("[open-rail] Three.js scene initialized")
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initialize scene on mount
  useEffect(() => {
    initScene()

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [initScene])

  // Update meshes when solids change
  useEffect(() => {
    if (!meshGroupRef.current || solids.length === 0) return

    const jscad = getJscadModule()
    if (!jscad) return

    // Clear existing meshes
    while (meshGroupRef.current.children.length > 0) {
      const child = meshGroupRef.current.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
      meshGroupRef.current.remove(child)
    }

    // Add new meshes
    for (const solid of solids) {
      try {
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
          flatShading: false,
        })

        const mesh = new THREE.Mesh(geometry, material)
        meshGroupRef.current.add(mesh)
      } catch (err) {
        console.error("[open-rail] Error creating mesh:", err)
      }
    }

    console.log("[open-rail] Updated meshes:", solids.length)
  }, [solids])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50">
          <div className="text-neutral-300 text-sm">Generating...</div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 left-2 text-xs text-neutral-500">
        Drag: rotate | Scroll: zoom | Right-drag: pan
      </div>
    </div>
  )
}
