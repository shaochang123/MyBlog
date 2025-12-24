<template>
  <div class="auth-container">
    <div class="container">
      <div class="auth-card">
        <h3 class="text-center mb-4">{{ isLogin ? '欢迎-登录' : '欢迎-注册' }}</h3>
        
        <div v-if="alertMsg" :class="['alert', alertSuccess ? 'alert-success' : 'alert-danger']" role="alert">
          {{ alertMsg }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label">{{ isLogin ? '账号名' : '注册账号名' }}</label>
            <input 
              type="text" 
              v-model="username" 
              class="form-control" 
              placeholder="请在此输入用户名"
            >
          </div>
          
          <div class="mb-3">
            <label class="form-label">{{ isLogin ? '密码' : '注册密码' }}</label>
            <input 
              type="password" 
              v-model="password" 
              class="form-control" 
              placeholder="请在此输入密码"
            >
          </div>

          <div v-if="!isLogin" class="mb-3">
            <label class="form-label">确认密码</label>
            <input 
              type="password" 
              v-model="confirmPassword" 
              class="form-control" 
              placeholder="请再次输入密码"
            >
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">{{ isLogin ? '登录' : '注册' }}</button>
          </div>

          <div class="text-end mt-3">
            <a href="#" @click.prevent="toggleMode" class="text-muted">
              {{ isLogin ? '没有账号?点击去注册' : '返回登录界面' }}
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AuthSystem',
  caseInfo: {
    title: '登录与注册系统',
    description: '演示用户注册、登录流程及表单验证功能。',
    path: 'auth'
  },
  data() {
    return {
      isLogin: true,
      username: '',
      password: '',
      confirmPassword: '',
      alertMsg: '',
      alertSuccess: false
    };
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin;
      this.username = '';
      this.password = '';
      this.confirmPassword = '';
      this.alertMsg = '';
    },
    showAlert(msg, success) {
      this.alertMsg = msg;
      this.alertSuccess = success;
      setTimeout(() => {
        this.alertMsg = '';
      }, 2000);
    },
    async handleSubmit() {
      const unameReg = /^[A-Za-z0-9]{8,}$/;
      const pwordReg = /^.{6,}$/;

      if (!unameReg.test(this.username) || !pwordReg.test(this.password)) {
        this.showAlert('用户名或密码不符合规范', false);
        return;
      }

      if (!this.isLogin && this.password !== this.confirmPassword) {
        this.showAlert('两次密码不一致', false);
        return;
      }

      try {
        const url = this.isLogin 
          ? 'https://hmajax.itheima.net/itheima-api/login' 
          : 'https://hmajax.itheima.net/itheima-api/register';
        
        const res = await axios.post(url, {
          username: this.username,
          password: this.password
        });

        this.showAlert(res.data.message, true);
      } catch (error) {
        this.showAlert(error.response?.data?.message || '操作失败', false);
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-sizing: border-box;
  margin-bottom: 0.5rem;
}

.btn-primary {
  width: 100%;
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}

.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border-color: #badbcc;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.text-center { text-align: center; }
.text-end { text-align: right; }
.text-muted { color: #6c757d; text-decoration: none; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-3 { margin-top: 1rem; }
</style>
