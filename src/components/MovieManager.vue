<template>
  <div class="card">
    <div class="card-header">
      <h2>🎥 电影管理</h2>
      <div class="search-box">
        <input v-model="searchQuery" placeholder="🔍 搜索电影..." class="search-input" />
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
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in filteredMovies" :key="movie.movie_id">
            <td>{{ movie.movie_id }}</td>
            <td>{{ movie.title }}</td>
            <td>{{ movie.director }}</td>
            <td>{{ movie.duration }} min</td>
            <td>
              <button @click="$emit('delete-movie', movie.movie_id)" class="btn btn-danger">下架</button>
            </td>
          </tr>
          <tr v-if="filteredMovies.length === 0">
            <td colspan="5" class="empty-state">暂无电影数据</td>
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
      newMovie: { title: '', director: '', duration: '' }
    }
  },
  computed: {
    filteredMovies() {
      if (!this.searchQuery) return this.movies;
      const query = this.searchQuery.toLowerCase();
      return this.movies.filter(m => 
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