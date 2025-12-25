<template>
  <div class="card">
    <div class="card-header">
      <h2>🎟️ 会员购票 (升级版)</h2>
    </div>
    <div class="form-group ticket-form">
      <!-- 1. 选会员 -->
      <select v-model="ticketForm.member_id" class="input-field">
        <option disabled value="">选择会员</option>
        <option v-for="member in members" :key="member.member_id" :value="member.member_id">
          {{ member.name }} (余额: {{ member.points || 0 }})
        </option>
      </select>

      <!-- 2. 选电影 -->
      <select v-model="selectedMovieId" @change="fetchShowtimes" class="input-field">
        <option disabled value="">选择电影</option>
        <option v-for="movie in movies" :key="movie.movie_id" :value="movie.movie_id">
          {{ movie.title }}
        </option>
      </select>

      <!-- 3. 选场次 -->
      <select v-model="ticketForm.showtime_id" class="input-field" :disabled="!showtimes.length">
        <option  value="">选择场次</option>
        <option v-for="s in showtimes" :key="s.id" :value="s.id">
          {{ formatDate(s.start_time) }} - {{ s.hall_name }} (￥{{ s.price }})
        </option>
      </select>

      <button @click="buyTicket" class="btn btn-warning" :disabled="!ticketForm.showtime_id">
        购买影票
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TicketPurchase',
  props: ['members', 'movies'],
  data() {
    return {
      selectedMovieId: '',
      showtimes: [],
      ticketForm: { member_id: '', showtime_id: '' }
    }
  },
  methods: {
    async fetchShowtimes() {
      if (!this.selectedMovieId) return;
      try {
        const res = await axios.get(`/api/showtimes/movie/${this.selectedMovieId}`);
        this.showtimes = res.data;
        this.ticketForm.showtime_id = ''; // 重置场次选择
      } catch (e) {
        console.error(e);
        this.showtimes = [];
      }
    },
    buyTicket() {
      const { member_id, showtime_id } = this.ticketForm;
      if (!member_id || !showtime_id) return alert('请填写完整购票信息');
      
      // 找到选中的场次信息，以便传递价格等
      const showtime = this.showtimes.find(s => s.id === showtime_id);
      
      this.$emit('buy-ticket', { 
        member_id, 
        showtime_id,
        price: showtime.price, // 使用场次设定的价格
        movie_id: this.selectedMovieId // 兼容旧逻辑
      });
      
      this.ticketForm = { member_id: '', showtime_id: '' };
      this.selectedMovieId = '';
      this.showtimes = [];
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  margin-bottom: 20px;
}
.form-group {
  display: flex;
  gap: 10px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  align-items: center;
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
.btn-warning {
  background: #f59e0b;
  color: white;
}
.btn-warning:hover {
  background: #d97706;
}
</style>