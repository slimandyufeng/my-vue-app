<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isEditorPage = computed(() => route.path === '/editor');
</script>

<template>
  <div class="app" :class="{ 'editor-mode': isEditorPage }">
    <header v-if="!isEditorPage">
      <nav>
        <router-link to="/">首页</router-link> |
        <router-link to="/about">关于</router-link> |
        <router-link to="/editor">编辑器</router-link>
      </nav>
    </header>
    
    <main :class="{ 'editor-main': isEditorPage }">
      <router-view />
    </main>
  </div>
</template>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.editor-mode {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

main {
  margin-top: 20px;
  height: calc(100vh - 80px);
}

.editor-main {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
}
</style>
