<template>
  <div class="card">
    <div class="card-header">
      <h2>👥 会员管理</h2>
      <div class="search-box">
        <input v-model="searchQuery" placeholder="🔍 搜索会员..." class="search-input" />
      </div>
    </div>

    <div class="form-group">
      <input v-model="newMember.name" placeholder="姓名" class="input-field" />
      <select v-model="newMember.gender" class="input-field">
        <option value="Male">男</option>
        <option value="Female">女</option>
      </select>
      <input v-model="newMember.points" placeholder="初始积分" type="number" class="input-field" />
      <button @click="addMember" class="btn btn-primary">添加会员</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>性别</th>
            <th>积分</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.member_id">
            <td>{{ member.member_id }}</td>
            <td>{{ member.name }}</td>
            <td>
              <span :class="['badge', (member.gender === 'Male' || member.gender === 'M') ? 'badge-blue' : 'badge-pink']">
                {{ (member.gender === 'Male' || member.gender === 'M') ? '男' : '女' }}
              </span>
            </td>
            <td class="points">{{ member.points }}</td>
            <td class="actions">
              <button @click="$emit('delete-member', member.member_id)" class="btn btn-danger btn-sm">删除</button>
              <button @click="$emit('open-recharge', member)" class="btn btn-success btn-sm">充值</button>
              <button @click="$emit('view-tickets', member)" class="btn btn-info btn-sm">查看影票</button>
            </td>
          </tr>
          <tr v-if="filteredMembers.length === 0">
            <td colspan="5" class="empty-state">暂无会员数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberManager',
  props: ['members'],
  data() {
    return {
      searchQuery: '',
      newMember: { name: '', gender: 'Male', points: 0 }
    }
  },
  computed: {
    filteredMembers() {
      if (!this.searchQuery) return this.members;
      const query = this.searchQuery.toLowerCase();
      return this.members.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.member_id.toString().includes(query)
      );
    }
  },
  methods: {
    addMember() {
      if (!this.newMember.name) return alert('请填写姓名');
      this.$emit('add-member', { ...this.newMember });
      this.newMember = { name: '', gender: 'Male', points: 0 };
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
}
.btn-danger:hover {
  background: #ff6b81;
}
.btn-success {
  background: #10b981;
  color: white;
}
.btn-success:hover {
  background: #059669;
}
.btn-info {
  background: #0ea5e9;
  color: white;
}
.btn-info:hover {
  background: #0284c7;
}
.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  margin-right: 5px;
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
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.badge-blue {
  background: #e0f2fe;
  color: #0369a1;
}
.badge-pink {
  background: #fce7f3;
  color: #be185d;
}
.points {
  font-family: monospace;
  font-weight: bold;
  color: #f59e0b;
}
</style>