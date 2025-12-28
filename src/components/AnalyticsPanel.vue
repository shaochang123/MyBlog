<template>
  <div class="card">
    <div class="card-header">
      <h2>📊 数据分析（Analytics）</h2>
    </div>
    <div class="form-group">
      <select v-model="queryType" class="input-field">
        <option value="hot">🔥 热销电影（售出票数大于平均）</option>
        <option value="above_avg_price">💰 高于均价电影</option>
        <option value="search">🔎 搜索电影</option>
        <option value="top_selling">🏆 近期热卖（按天数）</option>
        <option value="revenue_by_movie">💵 各电影收入</option>
        <option value="member_spend">👥 会员消费排行</option>
        <option value="popular_halls">🏟️ 热门影厅</option>
        <option value="showtime_occupancy">📈 场次上座率</option>
        <option value="no_showtimes">❗ 无排片电影</option>
      </select>
      <div v-if="queryType === 'search'" class="input-group">
        <input v-model="params.q" placeholder="搜索关键字" class="input-field" />
        <input v-model.number="params.limit" type="number" class="input-field small" placeholder="limit" />
      </div>
      <div v-if="queryType === 'top_selling'" class="input-group">
        <input v-model.number="params.days" type="number" class="input-field small" placeholder="days" />
        <input v-model.number="params.limit" type="number" class="input-field small" placeholder="limit" />
      </div>
      <div class="actions">
        <button @click="runQuery" class="btn btn-primary">运行</button>
      </div>
    </div>

    <div class="results">
      <table v-if="rows.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id || r.movie_id || r.ticket_id">
            <td v-for="col in columns" :key="col">{{ formatValue(r[col]) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">暂无数据 — 运行查询看看</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'AnalyticsPanel',
  data() {
    return {
      queryType: 'hot',
      params: { q: '', days: 30, limit: 10 },
      rows: [],
      columns: []
    }
  },
  methods: {
    async runQuery() {
      try {
        const res = await axios.get(`/api/analytics/${this.queryType}`, { params: this.params });
        this.rows = res.data || [];
        this.columns = this.rows.length ? Object.keys(this.rows[0]) : [];
      } catch (e) {
        console.error('Query failed', e);
        alert('查询失败: ' + (e.response?.data?.error || e.message));
      }
    },
    formatValue(v) {
      if (typeof v === 'number') return Number(v).toFixed(2);
      return v;
    }
  }
}
</script>

<style scoped>
.card { padding: 20px; background: white; border-radius: 8px; }
.form-group { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.input-field { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.input-field.small { width: 80px; }
.actions { margin-left: auto; }
.results { margin-top: 12px; }
.table { width: 100%; }
.empty-state { color: #777; padding: 12px; }
</style>
