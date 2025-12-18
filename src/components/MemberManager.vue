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