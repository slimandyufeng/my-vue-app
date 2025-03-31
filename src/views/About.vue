<template>
  <div class="about">
    <h1>关于我们</h1>
    <p>这是关于页面的内容</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPage',
  components: {},
  setup() {
    return {}
  }
})
</script>

<style scoped>
.about {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 