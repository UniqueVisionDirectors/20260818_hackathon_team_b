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

const router = useRouter()
const authStore = useAuthStore()

// グラフ入力テキスト
const rawInput = ref('')

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  await router.push('/login')
}

// 反映ボタンを押した時の処理
const handleApplyGraph = (): void => {
  if (!rawInput.value.trim()) {
    return
  }

  // ここで入力テキスト（rawInput.value）をもとに処理を行います
  console.log('グラフ入力データ:', rawInput.value)
}

const handleClear = (): void => {
  rawInput.value = ''
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
</style>

