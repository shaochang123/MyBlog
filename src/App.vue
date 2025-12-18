<template>
  <div id="app">
    <AppHeader />

    <div class="container">
      <MovieManager 
        :movies="movies" 
        @add-movie="addMovie" 
        @delete-movie="deleteMovie" 
      />

      <MemberManager 
        :members="members" 
        @add-member="addMember" 
        @delete-member="deleteMember"
        @open-recharge="openRecharge"
        @view-tickets="viewTickets"
      />

      <TicketPurchase 
        :members="members" 
        :movies="movies" 
        @buy-ticket="buyTicket" 
      />
    </div>

    <RechargeModal 
      :show="showRechargeModal" 
      :member="currentMember" 
      @close="showRechargeModal = false" 
      @confirm="confirmRecharge" 
    />

    <TicketListModal 
      :show="showTicketsModal" 
      :member="currentMember" 
      :tickets="memberTickets" 
      @close="showTicketsModal = false" 
      @delete-ticket="deleteTicket" 
    />
  </div>
</template>

<script>
import axios from 'axios';
import { io } from 'socket.io-client';
import AppHeader from './components/AppHeader.vue';
import MovieManager from './components/MovieManager.vue';
import MemberManager from './components/MemberManager.vue';
import TicketPurchase from './components/TicketPurchase.vue';
import RechargeModal from './components/RechargeModal.vue';
import TicketListModal from './components/TicketListModal.vue';

const API_URL = '/api';

export default {
  name: 'App',
  components: {
    AppHeader,
    MovieManager,
    MemberManager,
    TicketPurchase,
    RechargeModal,
    TicketListModal
  },
  data() {
    return {
      socket: null,
      movies: [],
      members: [],
      
      showRechargeModal: false,
      currentMember: null,

      showTicketsModal: false,
      memberTickets: []
    };
  },
  mounted() {
    this.fetchMovies();
    this.fetchMembers();

    // Connect to Socket.io server (using relative path via proxy)
    this.socket = io(); 
    this.socket.on('data-update', () => {
      this.fetchMovies();
      this.fetchMembers();
      if (this.showTicketsModal && this.currentMember) {
        this.viewTickets(this.currentMember);
      }
    });
  },
  beforeUnmount() {
    if (this.socket) this.socket.disconnect();
  },
  methods: {
    async fetchMovies() {
      try {
        const res = await axios.get(`${API_URL}/movies`);
        this.movies = res.data;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchMembers() {
      try {
        const res = await axios.get(`${API_URL}/members`);
        this.members = res.data;
      } catch (error) {
        console.error(error);
      }
    },
    async addMovie(movie) {
      try {
        await axios.post(`${API_URL}/movies`, movie);
        this.fetchMovies();
      } catch (error) {
        alert('添加失败');
      }
    },
    async deleteMovie(id) {
      if (!confirm('确定下架该电影吗？')) return;
      try {
        await axios.delete(`${API_URL}/movies/${id}`);
        this.fetchMovies();
      } catch (error) {
        alert('删除失败');
      }
    },
    async addMember(member) {
      try {
        await axios.post(`${API_URL}/members`, member);
        this.fetchMembers();
      } catch (error) {
        alert('添加失败');
      }
    },
    async deleteMember(id) {
      if (!confirm('确定删除该会员吗？')) return;
      try {
        await axios.delete(`${API_URL}/members/${id}`);
        this.fetchMembers();
      } catch (error) {
        alert('删除失败');
      }
    },
    openRecharge(member) {
      this.currentMember = member;
      this.showRechargeModal = true;
    },
    async confirmRecharge(amount) {
      try {
        await axios.post(`${API_URL}/members/${this.currentMember.member_id}/recharge`, { amount });
        this.showRechargeModal = false;
        this.fetchMembers();
      } catch (error) {
        alert('充值失败');
      }
    },
    async buyTicket(ticketData) {
      try {
        await axios.post(`${API_URL}/tickets/buy`, ticketData);
        alert('购票成功');
        this.fetchMembers(); 
      } catch (error) {
        alert(error.response?.data || '购票失败');
      }
    },
    async viewTickets(member) {
      this.currentMember = member;
      try {
        const res = await axios.get(`${API_URL}/members/${member.member_id}/tickets`);
        this.memberTickets = res.data;
        this.showTicketsModal = true;
      } catch (error) {
        alert('获取影票失败');
      }
    },
    async deleteTicket(id) {
      if (!confirm('确定要退票吗？积分将返还。')) return;
      try {
        await axios.delete(`${API_URL}/tickets/${id}`);
        this.viewTickets(this.currentMember); 
        this.fetchMembers(); 
      } catch (error) {
        alert('退票失败');
      }
    }
  }
};
</script>

<style>
:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --secondary-color: #64748b;
  --danger-color: #ef4444;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-color: #1e293b;
  --border-color: #e2e8f0;
}

body {
  margin: 0;
  background-color: var(--bg-color);
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 0 1.5rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 2rem;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.input-field, .search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  background-color: #f8fafc;
}

.input-field:focus, .search-input:focus {
  border-color: var(--primary-color);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input {
  width: 280px;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary { background: linear-gradient(to right, var(--primary-color), var(--primary-hover)); }
.btn-danger { background: linear-gradient(to right, var(--danger-color), #dc2626); }
.btn-success { background: linear-gradient(to right, var(--success-color), #059669); }
.btn-warning { background: linear-gradient(to right, var(--warning-color), #d97706); }
.btn-info { background: linear-gradient(to right, var(--info-color), #2563eb); }
.btn-secondary { background-color: var(--secondary-color); }

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
}

.btn-xs {
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th {
  background-color: #f1f5f9;
  color: var(--secondary-color);
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  vertical-align: middle;
  color: var(--text-color);
}

tr:hover td {
  background-color: #f8fafc;
}

.badge {
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge-blue { background-color: #e0e7ff; color: #3730a3; }
.badge-pink { background-color: #fce7f3; color: #9d174d; }

.points {
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 700;
  color: var(--warning-color);
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--secondary-color);
  font-style: italic;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.wide-modal {
  max-width: 700px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.ticket-form {
  justify-content: center;
  background: linear-gradient(to right, #fffbeb, #fef3c7);
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid #fcd34d;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
</style>
