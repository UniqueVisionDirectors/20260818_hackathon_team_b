import { describe, expect, it } from 'vitest'
import type { GraphLayout } from '@/types/graph.types'
import { createGraphMeshSpecs } from './createGraphScene'

describe('createGraphMeshSpecs', () => {
  it('builds node and edge specs from a GraphLayout', () => {
    const layout: GraphLayout = {
      nodes: [
        { id: 0, x: 0, y: 1, z: 0 },
        { id: 1, x: 2, y: 0, z: 0 },
      ],
      edges: [{ source: 0, target: 1 }],
    }

    const specs = createGraphMeshSpecs(layout)

    expect(specs.nodes).toHaveLength(2)
    expect(specs.nodes[0]).toMatchObject({
      id: 0,
      position: { x: 0, y: 1, z: 0 },
    })
    expect(specs.edges).toEqual([
      {
        source: 0,
        target: 1,
        start: { x: 0, y: 1, z: 0 },
        end: { x: 2, y: 0, z: 0 },
      },
    ])
  })
})
