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