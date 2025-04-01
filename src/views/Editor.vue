<template>
  <div class="editor-page">
    <GrapesEditor />
  </div>
</template>

<script>
import GrapesEditor from '../components/GrapesEditor.vue';

export default {
  name: 'EditorPage',
  components: {
    GrapesEditor
  }
}
</script>

<style scoped>
.editor-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style> 