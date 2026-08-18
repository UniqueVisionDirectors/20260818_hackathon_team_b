import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import type { GraphEdge, GraphLayout, GraphNode3D } from '@/types/graph.types'

export interface GraphNodeMeshSpec {
  id: number
  position: { x: number; y: number; z: number }
}

export interface GraphEdgeMeshSpec {
  source: number
  target: number
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
}

export interface GraphSceneMeshSpecs {
  nodes: GraphNodeMeshSpec[]
  edges: GraphEdgeMeshSpec[]
}

export const createGraphMeshSpecs = (layout: GraphLayout): GraphSceneMeshSpecs => ({
  nodes: layout.nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y, z: node.z },
  })),
  edges: layout.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    start: {
      x: layout.nodes[edge.source]?.x ?? 0,
      y: layout.nodes[edge.source]?.y ?? 0,
      z: layout.nodes[edge.source]?.z ?? 0,
    },
    end: {
      x: layout.nodes[edge.target]?.x ?? 0,
      y: layout.nodes[edge.target]?.y ?? 0,
      z: layout.nodes[edge.target]?.z ?? 0,
    },
  })),
})

const buildNode = (scene: Scene, node: GraphNode3D) => {
  const sphere = MeshBuilder.CreateSphere(`node-${String(node.id)}`, { diameter: 0.65 }, scene)
  sphere.position = new Vector3(node.x, node.y, node.z)

  const material = new StandardMaterial(`node-material-${String(node.id)}`, scene)
  material.diffuseColor = new Color3(0.23, 0.78, 1)
  material.emissiveColor = new Color3(0.08, 0.2, 0.28)
  sphere.material = material

  return sphere
}

const buildEdge = (scene: Scene, edge: GraphEdge, start: GraphNode3D, end: GraphNode3D) => {
  const points = [
    new Vector3(start.x, start.y, start.z),
    new Vector3(end.x, end.y, end.z),
  ]

  const line = MeshBuilder.CreateLines(
    `edge-${String(edge.source)}-${String(edge.target)}`,
    { points },
    scene,
  )
  const material = new StandardMaterial(
    `edge-material-${String(edge.source)}-${String(edge.target)}`,
    scene,
  )
  material.diffuseColor = new Color3(0.7, 0.82, 1)
  material.emissiveColor = new Color3(0.14, 0.18, 0.24)
  line.material = material

  return line
}

export const createGraphScene = (
  engine: AbstractEngine,
  canvas: HTMLCanvasElement,
  layout: GraphLayout,
): Scene => {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.03, 0.05, 0.09, 1)

  const camera = new ArcRotateCamera(
    'graph-camera',
    -Math.PI / 2,
    Math.PI / 2.2,
    10,
    new Vector3(0, 0, 0),
    scene,
  )
  camera.lowerRadiusLimit = 4
  camera.upperRadiusLimit = 18
  camera.wheelDeltaPercentage = 0.02
  camera.attachControl(canvas, true)

  const light = new HemisphericLight('graph-light', new Vector3(0, 1, 0), scene)
  light.intensity = 0.9

  const specs = createGraphMeshSpecs(layout)

  const nodeMap = new Map<number, GraphNode3D>()
  for (const node of layout.nodes) {
    nodeMap.set(node.id, node)
    buildNode(scene, node)
  }

  for (const edge of specs.edges) {
    const start = nodeMap.get(edge.source)
    const end = nodeMap.get(edge.target)

    if (!start || !end) {
      continue
    }

    buildEdge(scene, { source: edge.source, target: edge.target }, start, end)
  }

  return scene
}
