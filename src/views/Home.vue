<template>
  <div class="home">
    <h1>首页</h1>
    <p>这是一个使用 Vue 3 + TypeScript + Vite 构建的应用</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomePage',
  components: {},
  setup() {
    return {}
  }
})
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 