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