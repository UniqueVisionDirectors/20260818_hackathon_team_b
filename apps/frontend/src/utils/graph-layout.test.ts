import { describe, expect, it } from 'vitest'
import { buildGraphLayout } from './graph-layout'

describe('buildGraphLayout', () => {
  it('converts GraphData into a renderable GraphLayout and keeps the graph centered', () => {
    const data = {
      nodeCount: 4,
      edges: [
        { source: 0, target: 1 },
        { source: 1, target: 2 },
        { source: 2, target: 3 },
      ],
    }

    const layout = buildGraphLayout(data)

    expect(layout.edges).toEqual(data.edges)
    expect(layout.nodes).toHaveLength(data.nodeCount)
    expect(layout.nodes.map((node) => node.id)).toEqual([0, 1, 2, 3])

    const averageX = layout.nodes.reduce((sum, node) => sum + node.x, 0) / layout.nodes.length
    const averageY = layout.nodes.reduce((sum, node) => sum + node.y, 0) / layout.nodes.length
    const averageZ = layout.nodes.reduce((sum, node) => sum + node.z, 0) / layout.nodes.length

    expect(Math.abs(averageX)).toBeLessThan(1e-8)
    expect(Math.abs(averageY)).toBeLessThan(1e-8)
    expect(Math.abs(averageZ)).toBeLessThan(1e-8)
  })
})
