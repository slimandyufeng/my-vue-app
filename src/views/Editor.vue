<template>
  <div class="editor-page">
    <GrapesEditor />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GrapesEditor from '../components/GrapesEditor.vue';

export default defineComponent({
  name: 'EditorPage',
  components: {
    GrapesEditor
  }
});
</script>

<style scoped>
.editor-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style> 