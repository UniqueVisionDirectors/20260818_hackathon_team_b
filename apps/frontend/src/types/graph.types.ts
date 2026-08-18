/** 辺: 2頂点の 0-indexed ID */
export interface GraphEdge {
  source: number
  target: number
}

/** パーサー出力: 頂点数と辺リスト */
export interface GraphData {
  nodeCount: number
  edges: GraphEdge[]
}

/** 3D座標を持つ頂点 */
export interface GraphNode3D {
  id: number
  x: number
  y: number
  z: number
}

/** レイアウト済みグラフ（描画用） */
export interface GraphLayout {
  nodes: GraphNode3D[]
  edges: GraphEdge[]
}
