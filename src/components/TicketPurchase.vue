<template>
  <div class="card">
    <div class="card-header">
      <h2>🎟️ 会员购票</h2>
    </div>
    <div class="form-group ticket-form">
      <select v-model="ticketForm.member_id" class="input-field">
        <option disabled value="">选择会员</option>
        <option v-for="member in members" :key="member.member_id" :value="member.member_id">
          {{ member.name }} (积分: {{ member.points }})
        </option>
      </select>
      <select v-model="ticketForm.movie_id" class="input-field">
        <option disabled value="">选择电影</option>
        <option v-for="movie in movies" :key="movie.movie_id" :value="movie.movie_id">
          {{ movie.title }}
        </option>
      </select>
      <input v-model="ticketForm.price" placeholder="票价 (积分)" type="number" class="input-field" />
      <button @click="buyTicket" class="btn btn-warning">购买影票</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketPurchase',
  props: ['members', 'movies'],
  data() {
    return {
      ticketForm: { member_id: '', movie_id: '', price: '' }
    }
  },
  methods: {
    buyTicket() {
      const { member_id, movie_id, price } = this.ticketForm;
      if (!member_id || !movie_id || !price) return alert('请填写完整购票信息');
      this.$emit('buy-ticket', { ...this.ticketForm });
      this.ticketForm = { member_id: '', movie_id: '', price: '' };
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