<template>
  <div class="card">
    <div class="card-header">
      <h2>🎥 电影管理</h2>
      <div class="search-box">
        <input v-model="searchQuery" placeholder="🔍 搜索电影..." class="search-input" />
        <label class="filter-checkbox"><input type="checkbox" v-model="showPopularOnly"> 🔥 热销</label>
        <label class="filter-checkbox"><input type="checkbox" v-model="showHighValueOnly"> 💰 高于均价</label>
      </div>
    </div>
    
    <div class="form-group">
      <input v-model="newMovie.title" placeholder="电影名称" class="input-field" />
      <input v-model="newMovie.director" placeholder="导演" class="input-field" />
      <input v-model="newMovie.duration" placeholder="时长 (分钟)" type="number" class="input-field" />
      <button @click="addMovie" class="btn btn-primary">上架电影</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>导演</th>
            <th>时长</th>
            <th>平均票价</th>
            <th>售出票数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in filteredMovies" :key="movie.movie_id">
            <td>{{ movie.movie_id }}</td>
            <td>{{ movie.title }}</td>
            <td>{{ movie.director }}</td>
            <td>{{ movie.duration }} min</td>
            <td>{{ movie.avg_price ? Number(movie.avg_price).toFixed(2) : '0.00' }}</td>
            <td>{{ movie.ticket_count || 0 }}</td>
            <td>
              <button @click="$emit('delete-movie', movie.movie_id)" class="btn btn-danger">下架</button>
            </td>
          </tr>
          <tr v-if="filteredMovies.length === 0">
            <td colspan="7" class="empty-state">暂无电影数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieManager',
  props: ['movies'],
  data() {
    return {
      searchQuery: '',
      showPopularOnly: false,
      showHighValueOnly: false,
      newMovie: { title: '', director: '', duration: '' }
    }
  },
  computed: {
    filteredMovies() {
      let result = this.movies;

      if (this.showPopularOnly) {
        result = result.filter(m => m.ticket_count > 0);
      }

      if (this.showHighValueOnly && this.movies.length > 0) {
        const globalAvg = this.movies[0].global_avg_price || 0;
        result = result.filter(m => m.avg_price > globalAvg);
      }

      if (!this.searchQuery) return result;
      const query = this.searchQuery.toLowerCase();
      return result.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.director.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    addMovie() {
      if (!this.newMovie.title || !this.newMovie.director) return alert('请填写完整信息');
      this.$emit('add-movie', { ...this.newMovie });
      this.newMovie = { title: '', director: '', duration: '' };
    }
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}
.input-field {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}
.btn-primary {
  background: #42b983;
  color: white;
}
.btn-primary:hover {
  background: #3aa876;
}
.btn-danger {
  background: #ff4757;
  color: white;
  padding: 4px 12px;
  font-size: 12px;
}
.btn-danger:hover {
  background: #ff6b81;
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}
tr:hover {
  background: #f8f9fa;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
}
</style>