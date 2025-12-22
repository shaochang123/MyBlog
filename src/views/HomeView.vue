<template>
  <div class="container page-container">
    <!-- Header / Welcome Banner -->
    <div class="hero-banner">
      <h1>欢迎来到我的主页</h1>
    </div>
    
    <div class="home-grid">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="card profile-card">
          <div class="avatar-container">
             <div class="avatar-placeholder">👤</div>
          </div>
        </div>

        <div class="card notice-card">
          <div class="card-header">
            <div class="indicator"></div>
            <h3>公告</h3>
          </div>
          <div class="card-body">
            <p>欢迎访问 shaochang's blog！</p>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="card content-card">
          <p>这里是主页内容...</p>
          
          <!-- Preserving navigation to cases as part of structure -->
          <div class="cases-navigation" style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <h3>项目展示</h3>
            <ul class="list-group">
              <li class="list-group-item">
                <router-link to="/cases/cinema">影院管理系统</router-link>
              </li>
              <li class="list-group-item">
                <router-link to="/cases/region">行政区划查询</router-link>
              </li>
              <li class="list-group-item">
                <router-link to="/cases/auth">登录与注册系统</router-link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}

/* Profile Card */
.profile-card {
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto;
}

/* Notice Card */
.notice-card .card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notice-card h3 {
  margin: 0;
  font-size: 1.1rem;
}

.indicator {
  width: 4px;
  height: 16px;
  background-color: var(--accent-color);
  border-radius: 2px;
}

.notice-card .card-body {
  padding: 1.5rem;
}

/* Main Content */
.content-card {
  padding: 2rem;
  min-height: 400px;
}

.list-group {
  list-style: none;
  padding: 0;
}

.list-group-item {
  margin-bottom: 0.5rem;
}

.list-group-item a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.list-group-item a:hover {
  text-decoration: underline;
}
</style>
