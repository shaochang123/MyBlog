<template>
  <div>
    <div class="container">
      <div class="system-header">
        <h1>🎬 电影院管理系统</h1>
      </div>
      
      <!-- 新增：影院后台管理 (影厅/排片) -->
      <CinemaAdmin :movies="movies" />

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
// socket.io 连接由 App.vue 统一管理，通过 inject 获取
import MovieManager from '../../components/MovieManager.vue';
import MemberManager from '../../components/MemberManager.vue';
import TicketPurchase from '../../components/TicketPurchase.vue';
import RechargeModal from '../../components/RechargeModal.vue';
import TicketListModal from '../../components/TicketListModal.vue';
import CinemaAdmin from '../../components/CinemaAdmin.vue';

const API_URL = '/api';

export default {
  name: 'CinemaSystem',
  caseInfo: {
    title: '影院管理系统',
    description: '完整的影院票务管理系统，包含影片管理、排片及购票功能。',
    path: 'cinema'
  },
  components: {
    MovieManager,
    MemberManager,
    TicketPurchase,
    RechargeModal,
    TicketListModal,
    CinemaAdmin
  },
  // 注入父组件共享的 socket（避免重复连接导致在线人数翻倍）
  inject: ['getSocket'],
  data() {
    return {
      movies: [],
      members: [],
      
      showRechargeModal: false,
      currentMember: null,

      showTicketsModal: false,
      memberTickets: [],
      
      dataUpdateHandler: null
    };
  },
  mounted() {
    this.fetchMovies();
    this.fetchMembers();

    // 复用 App.vue 的 socket 连接，只监听数据更新事件
    const socket = this.getSocket();
    if (socket) {
      this.dataUpdateHandler = () => {
        this.fetchMovies();
        this.fetchMembers();
        if (this.showTicketsModal && this.currentMember) {
          this.viewTickets(this.currentMember);
        }
      };
      socket.on('data-update', this.dataUpdateHandler);
    }
  },
  beforeUnmount() {
    // 只移除事件监听器，不断开连接（连接由 App.vue 管理）
    const socket = this.getSocket();
    if (socket && this.dataUpdateHandler) {
      socket.off('data-update', this.dataUpdateHandler);
    }
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

<style scoped>
.system-header {
  text-align: center;
  margin-bottom: 2rem;
}

.system-header h1 {
  color: #1e293b;
  font-size: 2rem;
}
</style>
