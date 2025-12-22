<template>
  <div id="app">
    <AppHeader />
    <div class="main-content">
      <router-view />
    </div>
    <footer class="app-footer">
      <p>总访问量：0</p>
      <p>当前在线人数：1</p>
    </footer>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'App',
  components: {
    AppHeader
  }
};
</script>

<style>
/* Global styles are now in src/assets/main.css */

.app-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: auto; /* Push footer to bottom */
}

.app-footer p {
  color: var(--text-secondary);
  margin: 5px 0;
}

.main-content {
  flex: 1; /* Allow content to grow and push footer down */
  width: 100%;
}
</style>
