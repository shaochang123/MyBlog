<template>
  <div id="app">
    <AppHeader />
    <div class="main-content">
      <router-view />
    </div>
    <footer class="app-footer">
      <p>总访问量：{{ totalVisits }}</p>
      <p>当前在线人数：{{ onlineUsers }}</p>
    </footer>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'App',
  components: {
    AppHeader
  },
  data() {
    return {
      socket: null,
      totalVisits: 0,
      onlineUsers: 0
    };
  },
  provide() {
    // 共享 socket 连接给子组件使用，避免重复创建连接
    return {
      getSocket: () => this.socket
    };
  },
  mounted() {
    // Connect to Socket.io
    this.socket = io();
    
    this.socket.on('connect', () => {
      // Check if this is a new session visit
      if (!sessionStorage.getItem('hasVisited')) {
        this.socket.emit('new-visit');
        sessionStorage.setItem('hasVisited', 'true');
      }
    });

    this.socket.on('stats-update', (stats) => {
      this.totalVisits = stats.totalVisits;
      this.onlineUsers = stats.onlineUsers;
    });
  },
  beforeUnmount() {
    if (this.socket) this.socket.disconnect();
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
