<template>
  <div class="admin-panel">
    <div class="tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'halls' }]" 
        @click="activeTab = 'halls'"
      >
        🏛️ 影厅管理
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'showtimes' }]" 
        @click="activeTab = 'showtimes'"
      >
        📅 排片管理
      </button>
    </div>

    <!-- 影厅管理 -->
    <div v-if="activeTab === 'halls'" class="tab-content">
      <div class="form-inline">
        <input v-model="newHall.name" placeholder="影厅名称 (如: 1号厅)" class="input-field" />
        <select v-model="newHall.type" class="input-field">
          <option value="2D">2D厅</option>
          <option value="3D">3D厅</option>
          <option value="IMAX">IMAX厅</option>
        </select>
        <input v-model="newHall.seat_count" type="number" placeholder="座位数" class="input-field" />
        <button @click="addHall" class="btn btn-primary">添加影厅</button>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>类型</th>
            <th>座位数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hall in halls" :key="hall.id">
            <td>{{ hall.id }}</td>
            <td>{{ hall.name }}</td>
            <td>{{ hall.type }}</td>
            <td>{{ hall.seat_count }}</td>
            <td><button @click="deleteHall(hall.id)" class="btn btn-danger btn-sm">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 排片管理 -->
    <div v-if="activeTab === 'showtimes'" class="tab-content">
      <div class="form-inline">
        <select v-model="newShowtime.movie_id" class="input-field">
          <option value="">选择电影</option>
          <option v-for="m in movies" :key="m.movie_id" :value="m.movie_id">{{ m.title }}</option>
        </select>
        <select v-model="newShowtime.hall_id" class="input-field">
          <option value="">选择影厅</option>
          <option v-for="h in halls" :key="h.id" :value="h.id">{{ h.name }}</option>
        </select>
        <input v-model="newShowtime.start_time" type="datetime-local" class="input-field" />
        <input v-model="newShowtime.price" type="number" placeholder="票价" class="input-field" />
        <button @click="addShowtime" class="btn btn-primary">发布排片</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>电影</th>
            <th>影厅</th>
            <th>时间</th>
            <th>票价</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in showtimes" :key="s.id">
            <td>{{ s.movie_title }}</td>
            <td>{{ s.hall_name }}</td>
            <td>{{ formatDate(s.start_time) }}</td>
            <td>{{ s.price }}</td>
            <td><button @click="deleteShowtime(s.id)" class="btn btn-danger btn-sm">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CinemaAdmin',
  props: ['movies'],
  data() {
    return {
      activeTab: 'halls',
      halls: [],
      showtimes: [],
      newHall: { name: '', type: '2D', seat_count: '' },
      newShowtime: { movie_id: '', hall_id: '', start_time: '', price: '' }
    };
  },
  mounted() {
    this.fetchHalls();
    this.fetchShowtimes();
  },
  methods: {
    async fetchHalls() {
      const res = await axios.get('/api/halls');
      this.halls = res.data;
    },
    async fetchShowtimes() {
      const res = await axios.get('/api/showtimes');
      this.showtimes = res.data;
    },
    async addHall() {
      if (!this.newHall.name) return alert('请输入影厅名称');
      await axios.post('/api/halls', this.newHall);
      this.newHall = { name: '', type: '2D', seat_count: '' };
      this.fetchHalls();
    },
    async deleteHall(id) {
      if (!confirm('确定删除?')) return;
      await axios.delete(`/api/halls/${id}`);
      this.fetchHalls();
    },
    async addShowtime() {
      if (!this.newShowtime.movie_id || !this.newShowtime.start_time) return alert('请填写完整');
      await axios.post('/api/showtimes', this.newShowtime);
      this.newShowtime = { movie_id: '', hall_id: '', start_time: '', price: '' };
      this.fetchShowtimes();
    },
    async deleteShowtime(id) {
      if (!confirm('确定删除?')) return;
      await axios.delete(`/api/showtimes/${id}`);
      this.fetchShowtimes();
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    }
  }
}
</script>

<style scoped>
.admin-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
}
.tab-btn.active {
  color: #42b983;
  font-weight: bold;
  border-bottom: 2px solid #42b983;
}
.form-inline {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  flex-wrap: wrap;
}
.input-field {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.btn-primary { background: #42b983; }
.btn-danger { background: #ff4d4f; }
.btn-sm { font-size: 12px; padding: 4px 8px; }
</style>
