<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>💰 为 {{ member?.name }} 充值</h3>
      </div>
      <div class="modal-body">
        <input v-model="amount" type="number" placeholder="输入充值金额" class="input-field full-width" />
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">取消</button>
        <button @click="confirm" class="btn btn-success">确认充值</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RechargeModal',
  props: ['show', 'member'],
  data() {
    return {
      amount: 0
    }
  },
  watch: {
    show(val) {
      if (val) this.amount = 0;
    }
  },
  methods: {
    confirm() {
      if (this.amount <= 0) return alert('请输入有效金额');
      this.$emit('confirm', this.amount);
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
}
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.btn-secondary {
  background: #64748b;
  color: white;
}
.btn-success {
  background: #10b981;
  color: white;
}
</style>