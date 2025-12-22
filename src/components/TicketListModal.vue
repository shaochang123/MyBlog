<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card wide-modal">
      <div class="modal-header">
        <h3>🎫 {{ member?.name }} 的影票记录</h3>
      </div>
      <div class="modal-body">
        <div class="table-container" v-if="tickets.length">
          <table>
            <thead>
              <tr>
                <th>电影</th>
                <th>消耗积分</th>
                <th>购票时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.ticket_id">
                <td>{{ ticket.title }}</td>
                <td class="points">-{{ ticket.price }}</td>
                <td>{{ formatDate(ticket.purchase_date) }}</td>
                <td>
                  <button @click="$emit('delete-ticket', ticket.ticket_id)" class="btn btn-danger btn-xs">退票</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <p>暂无购票记录</p>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-primary">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketListModal',
  props: ['show', 'member', 'tickets'],
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.modal-card.wide-modal {
  width: 600px;
}
.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.modal-body {
  padding: 20px;
  overflow-y: auto;
}
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  padding: 20px;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.btn-primary {
  background: #4f46e5;
  color: white;
}
.btn-danger {
  background: #ef4444;
  color: white;
}
.btn-xs {
  padding: 2px 8px;
  font-size: 12px;
}
.points {
  color: #ef4444;
  font-weight: bold;
}
</style>