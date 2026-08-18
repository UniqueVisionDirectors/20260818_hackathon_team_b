import type { GraphData, GraphLayout, GraphNode3D } from '@/types/graph.types'

export type LayoutFn = (data: GraphData, radius?: number) => GraphNode3D[]

/** 0 〜 nodeCount-1 の GraphNode3D 配列を座標 (0,0,0) で宣言 */
function createEmptyNodes(nodeCount: number): GraphNode3D[] {
  const nodes: GraphNode3D[] = []

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: i, x: 0, y: 0, z: 0 })
  }

  return nodes
}

export const randomSphereLayout: LayoutFn = (
  data: GraphData,
  radius = 50,
): GraphNode3D[] => {
  const nodes = createEmptyNodes(data.nodeCount)

  for (const node of nodes) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    node.x = radius * Math.sin(phi) * Math.cos(theta)
    node.y = radius * Math.sin(phi) * Math.sin(theta)
    node.z = radius * Math.cos(phi)
  }

  return nodes
}

export const forceDirectedLayout: LayoutFn = (
  data: GraphData,
  radius = 50,
): GraphNode3D[] => {
  const nodes = createEmptyNodes(data.nodeCount)

  for (const node of nodes) {
    node.x = (Math.random() - 0.5) * radius
    node.y = (Math.random() - 0.5) * radius
    node.z = (Math.random() - 0.5) * radius
  }

  const iterations = 100
  const k = (radius * 1.5) / Math.cbrt(data.nodeCount > 0 ? data.nodeCount : 1)
  const kSquared = k * k
  let temperature = radius

  for (let i = 0; i < iterations; i++) {
    const displacements = nodes.map(() => ({ dx: 0, dy: 0, dz: 0 }))

    for (let v = 0; v < nodes.length; v++) {
      for (let u = v + 1; u < nodes.length; u++) {
        const nodeV = nodes[v]
        const nodeU = nodes[u]
        const dispV = displacements[v]
        const dispU = displacements[u]

        if (!nodeV || !nodeU || !dispV || !dispU) {
          continue
        }

        let dx = nodeV.x - nodeU.x
        let dy = nodeV.y - nodeU.y
        let dz = nodeV.z - nodeU.z

        let distSquared = dx * dx + dy * dy + dz * dz
        if (distSquared === 0) {
          dx = (Math.random() - 0.5) * 0.1
          dy = (Math.random() - 0.5) * 0.1
          dz = (Math.random() - 0.5) * 0.1
          distSquared = dx * dx + dy * dy + dz * dz
        }

        const dist = Math.sqrt(distSquared)
        const force = kSquared / dist

        const forceX = (dx / dist) * force
        const forceY = (dy / dist) * force
        const forceZ = (dz / dist) * force

        dispV.dx += forceX
        dispV.dy += forceY
        dispV.dz += forceZ

        dispU.dx -= forceX
        dispU.dy -= forceY
        dispU.dz -= forceZ
      }
    }

    for (const edge of data.edges) {
      const v = edge.source
      const u = edge.target

      const nodeV = nodes[v]
      const nodeU = nodes[u]
      const dispV = displacements[v]
      const dispU = displacements[u]

      if (!nodeV || !nodeU || !dispV || !dispU) {
        continue
      }

      const dx = nodeV.x - nodeU.x
      const dy = nodeV.y - nodeU.y
      const dz = nodeV.z - nodeU.z

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist === 0) {
        continue
      }

      const force = (dist * dist) / k

      const forceX = (dx / dist) * force
      const forceY = (dy / dist) * force
      const forceZ = (dz / dist) * force

      dispV.dx -= forceX
      dispV.dy -= forceY
      dispV.dz -= forceZ

      dispU.dx += forceX
      dispU.dy += forceY
      dispU.dz += forceZ
    }

    for (let v = 0; v < nodes.length; v++) {
      const nodeV = nodes[v]
      const disp = displacements[v]

      if (!nodeV || !disp) {
        continue
      }

      const dist = Math.sqrt(disp.dx * disp.dx + disp.dy * disp.dy + disp.dz * disp.dz)

      if (dist > 0) {
        const limitedDist = Math.min(dist, temperature)
        nodeV.x += (disp.dx / dist) * limitedDist
        nodeV.y += (disp.dy / dist) * limitedDist
        nodeV.z += (disp.dz / dist) * limitedDist
      }
    }

    temperature *= 0.95
  }

  if (nodes.length > 0) {
    let cx = 0
    let cy = 0
    let cz = 0

    for (const node of nodes) {
      cx += node.x
      cy += node.y
      cz += node.z
    }

    cx /= nodes.length
    cy /= nodes.length
    cz /= nodes.length

    for (const node of nodes) {
      node.x -= cx
      node.y -= cy
      node.z -= cz
    }
  }

  return nodes
}

export function computeGraphLayout(
  data: GraphData,
  layoutFn: LayoutFn = forceDirectedLayout,
  radius = 50,
): GraphNode3D[] {
  if (data.nodeCount <= 0) {
    return []
  }

  return layoutFn(data, radius)
}

export function buildGraphLayout(
  data: GraphData,
  layoutFn: LayoutFn = forceDirectedLayout,
  radius = 50,
): GraphLayout {
  return {
    nodes: computeGraphLayout(data, layoutFn, radius),
    edges: data.edges,
  }
}
