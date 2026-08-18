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


/**
 * 力学モデル (Force-directed) 配置
 *
 * 化合物の分子モデルのように、頂点間の反発力と辺の引力をシミュレーションして
 * 安定した自然な 3D 配置を計算します (Fruchterman-Reingold 系のアルゴリズム)。
 */
export const forceDirectedLayout: LayoutFn = (
  data: GraphData,
  radius = 50,
): GraphNode3D[] => {
  const nodes = createEmptyNodes(data.nodeCount)

  // 1. 初期配置 (ランダムな小さな領域内に配置)
  for (const node of nodes) {
    node.x = (Math.random() - 0.5) * radius
    node.y = (Math.random() - 0.5) * radius
    node.z = (Math.random() - 0.5) * radius
  }

  // シミュレーションのパラメータ
  const iterations = 100        // シミュレーション回数
  // radius を基準とした理想的なバネの長さ。頂点数が多いほど密にならないよう調整
  const k = (radius * 1.5) / Math.cbrt(data.nodeCount > 0 ? data.nodeCount : 1)
  const kSquared = k * k
  let temperature = radius      // 初期温度（1回の移動量の最大値）

  for (let i = 0; i < iterations; i++) {
    const displacements = nodes.map(() => ({ dx: 0, dy: 0, dz: 0 }))

    // 2. 反発力の計算 (全頂点ペア)
    for (let v = 0; v < nodes.length; v++) {
      for (let u = v + 1; u < nodes.length; u++) {
        const nodeV = nodes[v]
        const nodeU = nodes[u]
        const dispV = displacements[v]
        const dispU = displacements[u]
        if (!nodeV || !nodeU || !dispV || !dispU) continue

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
        const force = kSquared / dist // クーロン反発力

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

    // 3. 引力の計算 (辺で繋がれた頂点)
    for (const edge of data.edges) {
      const v = edge.source
      const u = edge.target
      
      const nodeV = nodes[v]
      const nodeU = nodes[u]
      const dispV = displacements[v]
      const dispU = displacements[u]
      if (!nodeV || !nodeU || !dispV || !dispU) continue

      const dx = nodeV.x - nodeU.x
      const dy = nodeV.y - nodeU.y
      const dz = nodeV.z - nodeU.z

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist === 0) continue

      const force = (dist * dist) / k // フックの法則による引力

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

    // 4. 座標の更新 (温度による移動量の制限)
    for (let v = 0; v < nodes.length; v++) {
      const nodeV = nodes[v]
      const disp = displacements[v]
      if (!nodeV || !disp) continue

      const dist = Math.sqrt(disp.dx * disp.dx + disp.dy * disp.dy + disp.dz * disp.dz)

      if (dist > 0) {
        // 温度を上限として移動
        const limitedDist = Math.min(dist, temperature)
        nodeV.x += (disp.dx / dist) * limitedDist
        nodeV.y += (disp.dy / dist) * limitedDist
        nodeV.z += (disp.dz / dist) * limitedDist
      }
    }

    // 5. クーリング (徐々に移動量を小さくして安定させる)
    temperature *= 0.95
  }

  // 最後に全体の中心を (0,0,0) に合わせる
  if (nodes.length > 0) {
    let cx = 0, cy = 0, cz = 0
    for (const n of nodes) {
      cx += n.x
      cy += n.y
      cz += n.z
    }
    cx /= nodes.length
    cy /= nodes.length
    cz /= nodes.length
    for (const n of nodes) {
      n.x -= cx
      n.y -= cy
      n.z -= cz
    }
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
 * import { computeGraphLayout, randomSphereLayout, forceDirectedLayout } from '@/utils/graph-layout'
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
 * // 力学モデル配置 (分子モデルのような自然な配置)
 * const layout2 = computeGraphLayout(data, forceDirectedLayout)
 * ```
 */
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
