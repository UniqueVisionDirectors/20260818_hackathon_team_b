<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink
          class="brand"
          to="/dashboard"
          aria-label="Babylon Stack ホーム"
        >
          <span
            class="brand__mark"
            aria-hidden="true"
          >B</span>
          <span>
            <strong>Graph Visualizer</strong>
            <small>Vue · Babylon.js · Hono</small>
          </span>
        </RouterLink>

        <div class="account">
          <span class="account__email">{{ authStore.currentUser?.email }}</span>
          <button
            class="button button--ghost"
            type="button"
            @click="handleLogout"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>

    <main class="dashboard">
      <section class="hero">
        <div class="hero__copy">
          <p class="eyebrow">
            GRAPH VISUALIZER
          </p>
          <h1>3D Graph Viewer</h1>
          <p>
            テキストエディタに入力したグラフデータを3D空間に可視化します。
          </p>
          <div
            class="tech-list"
            aria-label="採用技術"
          >
            <span>Vue 3</span>
            <span>Babylon.js</span>
            <span>Hono</span>
            <span>PostgreSQL</span>
          </div>
        </div>

        <!-- 描画担当側と衝突しないよう元のまま配置 -->
        <BabylonCanvas class="hero__viewer" />
      </section>

      <section
        class="workspace"
        aria-labelledby="workspace-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              GRAPH INPUT
            </p>
            <h2 id="workspace-title">
              グラフデータ入力
            </h2>
          </div>
          <p>グラフデータを入力して反映ボタンを押してください。</p>
        </div>

        <div class="workspace__grid">
          <article class="panel">
            <div class="panel__heading">
              <div>
                <span class="panel__number">01</span>
                <h3>エディタ</h3>
              </div>
            </div>

            <form
              class="editor-form"
              @submit.prevent="handleApplyGraph"
            >
              <textarea
                v-model="rawInput"
                class="graph-textarea"
                rows="10"
                placeholder="5 5&#10;1 2&#10;2 3&#10;3 4&#10;4 5&#10;5 1"
                spellcheck="false"
              />

              <div class="button-group">
                <button
                  class="button button--primary"
                  type="submit"
                >
                  グラフを反映
                </button>
                <button
                  class="button button--ghost"
                  type="button"
                  @click="handleClear"
                >
                  クリア
                </button>
              </div>
            </form>

            <!-- パースエラー時の表示 -->
            <p
              v-if="errorMessage"
              class="feedback feedback--error"
            >
              {{ errorMessage }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BabylonCanvas from '@/components/BabylonCanvas.vue'
import { useAuthStore } from '@/stores'
import type { GraphData, GraphEdge } from '@/types/graph.types'

const router = useRouter()
const authStore = useAuthStore()

// グラフ入力テキスト
const rawInput = ref('')
const errorMessage = ref('')

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  await router.push('/login')
}

/**
 * テキスト（AtCoder形式）をパースして GraphData を作る関数
 */
const parseGraphText = (text: string): GraphData => {
  // 空白・改行で分解
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    throw new Error('入力が空です。')
  }

  // 1番目: 頂点数 N
  const nodeCount = parseInt(tokens[0], 10)
  if (isNaN(nodeCount) || nodeCount <= 0) {
    throw new Error('1行目には頂点数 N を入力してください。')
  }

  const edges: GraphEdge[] = []
  
  // 2番目に M (辺数) がある場合はスキップ、以降を辺として読み取る
  let tokenIdx = tokens.length > 1 ? 2 : 1

  while (tokenIdx < tokens.length) {
    if (tokenIdx + 1 >= tokens.length) {
      throw new Error(`辺の指定が不正です（頂点数が奇数です: ${tokens[tokenIdx]}）`)
    }

    const uRaw = parseInt(tokens[tokenIdx], 10)
    const vRaw = parseInt(tokens[tokenIdx + 1], 10)

    if (isNaN(uRaw) || isNaN(vRaw)) {
      throw new Error(`数値以外の値が含まれています: "${tokens[tokenIdx]}" "${tokens[tokenIdx + 1]}"`)
    }

    // AtCoder の 1-indexed を 0-indexed に変換
    const u = uRaw - 1
    const v = vRaw - 1

    if (u < 0 || u >= nodeCount || v < 0 || v >= nodeCount) {
      throw new Error(`頂点番号が範囲外です: (${uRaw}, ${vRaw}) / 頂点数: ${nodeCount}`)
    }

    edges.push({ source: u, target: v })
    tokenIdx += 2
  }

  return { nodeCount, edges }
}

// 反映ボタンを押した時の処理
const handleApplyGraph = (): void => {
  errorMessage.value = ''

  if (!rawInput.value.trim()) {
    return
  }

  try {
    // ここでパースを実行！
    const parsedData: GraphData = parseGraphText(rawInput.value)

    // コンソールでパース結果を確認
    console.log('✅ パース成功 (GraphData):', parsedData)

    // ※ 計算担当の関数や Store が出来たらここに渡します
    // 例: calculateLayout(parsedData) や graphStore.setGraphData(parsedData)
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'パースエラーが発生しました。'
    }
  }
}

const handleClear = (): void => {
  rawInput.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.graph-textarea {
  width: 100%;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #333);
  background-color: var(--input-bg, #111);
  color: #fff;
  resize: vertical;
  line-height: 1.4;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.feedback--error {
  color: #ff6e7e;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}
</style>

