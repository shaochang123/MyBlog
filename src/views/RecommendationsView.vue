<template>
  <div class="container page-container">
    <div class="hero-banner">
      <h1>推荐资源</h1>
    </div>

    <div class="recommendations-grid">
      <div v-for="item in cases" :key="item.path" class="card case-card">
        <div class="card-header">
          <h3>{{ item.title }}</h3>
        </div>
        <div class="card-body">
          <p>{{ item.description }}</p>
          <router-link :to="item.path" class="btn btn-primary">查看案例</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecommendationsView',
  data() {
    return {
      cases: []
    }
  },
  created() {
    const files = require.context('./cases', false, /\.vue$/)
    this.cases = files.keys().map(key => {
      const component = files(key).default || files(key)
      const name = key.replace(/^\.\/(.*)\.\w+$/, '$1')
      const pathSegment = component.caseInfo?.path || name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      
      return {
        title: component.caseInfo?.title || name,
        description: component.caseInfo?.description || '暂无描述',
        path: `/cases/${pathSegment}`
      }
    })
  }
}
</script>

<style scoped>
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.case-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-body p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-color);
}
</style>
