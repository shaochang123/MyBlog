<template>
  <div class="container page-container">
    <div class="hero-banner">
      <h1>更新日志</h1>
    </div>

    <div class="card timeline-card">
      <div class="timeline">
        <!-- Original Content Item -->
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">2025-01-05</div>
            <div class="timeline-body">
              <p>更新日志功能上线...</p>
            </div>
          </div>
        </div>

        <!-- Placeholder for v-for loop if data existed, keeping structure ready -->
        <div v-for="i in 3" :key="i" class="timeline-item" style="opacity: 0.5;">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">...</div>
            <div class="timeline-body">
              <p>更多更新敬请期待</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdatesView'
}
</script>

<style scoped>
.timeline-card {
  padding: 3rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
  border-left: 2px solid var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2.6rem; /* Adjust based on padding-left + border width */
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  background-color: var(--bg-color);
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
}

.timeline-date {
  font-family: 'Fira Code', monospace;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.timeline-body {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
</style>
