// src/stores/graph.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GraphData } from '@/types/graph.types'

export const useGraphStore = defineStore('graph', () => {
  // あなたが渡すデータ（計算担当の人がここから読み取ります）
  const graphData = ref<GraphData | null>(null)

  // あなたがデータをセットするための関数
  const setGraphData = (data: GraphData | null) => {
    graphData.value = data
  }

  return {
    graphData,
    setGraphData
  }
})
