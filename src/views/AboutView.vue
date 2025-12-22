<template>
  <div class="container page-container">
    <div class="hero-banner">
      <h1>关于我</h1>
    </div>

    <div class="card content-card">
      <div class="empty-state">
        <div class="icon">ℹ️</div>
        <p>暂无详细信息</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.content-card {
  padding: 4rem 2rem;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state .icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.2rem;
}
</style>
