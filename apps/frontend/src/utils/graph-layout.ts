import type { GraphData, GraphNode3D } from '@/types/graph.types'

// ---------------------------------------------------------------------------
// 型: レイアウト関数のシグネチャ
// ---------------------------------------------------------------------------

/**
 * レイアウト関数の共通シグネチャ。
 * GraphData を受け取り、各頂点に 3D 座標を割り当てた GraphNode3D[] を返す。
 *
 * @param data   - パーサー出力（頂点数 + 辺リスト）
 * @param radius - 配置時の球の半径（デフォルト: 50）
 */
export type LayoutFn = (data: GraphData, radius?: number) => GraphNode3D[]

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/** 0 〜 nodeCount-1 の GraphNode3D 配列を座標 (0,0,0) で宣言*/
function createEmptyNodes(nodeCount: number): GraphNode3D[] {
  const nodes: GraphNode3D[] = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: i, x: 0, y: 0, z: 0 })
  }
  return nodes
}

// ---------------------------------------------------------------------------
// レイアウトアルゴリズム
// ---------------------------------------------------------------------------

/**
 * ランダム球面配置
 *
 * 各頂点を半径 `radius` の球面上にランダムに配置する。
 * グラフ構造（辺）は考慮しないが、初期配置やプレビュー用途に適する。
 */
export const randomSphereLayout: LayoutFn = (
  data: GraphData,
  radius = 50,
): GraphNode3D[] => {
  const nodes = createEmptyNodes(data.nodeCount)

  for (const node of nodes) {
    // 球面上の一様分布: θ ∈ [0, 2π), φ ∈ [0, π]
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    node.x = radius * Math.sin(phi) * Math.cos(theta)
    node.y = radius * Math.sin(phi) * Math.sin(theta)
    node.z = radius * Math.cos(phi)
  }

  return nodes
}


// ---------------------------------------------------------------------------
// メインの変換関数
// ---------------------------------------------------------------------------

/**
 * GraphData を 3D 座標付き頂点配列 (GraphNode3D[]) に変換する。
 *
 * @param data      - パーサー出力（頂点数 + 辺リスト）
 * @param layoutFn  - 使用するレイアウト関数（デフォルト: randomSphereLayout）
 * @param radius    - 配置時の球/グリッドの半径（デフォルト: 50）
 * @returns 3D 座標付きの GraphNode3D[]
 *
 * @example
 * ```ts
 * import { computeGraphLayout, gridLayout } from '@/utils/graph-layout'
 *
 * const data: GraphData = {
 *   nodeCount: 5,
 *   edges: [
 *     { source: 0, target: 1 },
 *     { source: 1, target: 2 },
 *   ],
 * }
 *
 * // デフォルト（ランダム球面）
 * const layout1 = computeGraphLayout(data)
 *
 * // グリッド配置、半径 100
 * const layout2 = computeGraphLayout(data, gridLayout, 100)
 * ```
 */
export function computeGraphLayout(
  data: GraphData,
  layoutFn: LayoutFn = randomSphereLayout,
  radius = 50,
): GraphNode3D[] {
  if (data.nodeCount <= 0) {
    return []
  }
  return layoutFn(data, radius)
}
