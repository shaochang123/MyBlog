<template>
  <div class="region-query-container">
    <div class="container">
      <h2 class="mb-4">地区查询案例</h2>
      <form @submit.prevent="queryArea" class="row g-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">省份名字</label>
          <input 
            type="text" 
            v-model="province" 
            class="form-control" 
            placeholder="请输入省份名称"
          >
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">城市名字</label>
          <input 
            type="text" 
            v-model="city" 
            class="form-control" 
            placeholder="请输入城市名称"
          >
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary">查询</button>
        </div>
      </form>

      <div class="mt-4">
        <p>地区列表：</p>
        <ul class="list-group">
          <li v-if="areas.length === 0 && !searched" class="list-group-item text-muted">暂无数据</li>
          <li v-else-if="areas.length === 0 && searched" class="list-group-item text-danger">请确认省份和城市是否输入正确</li>
          <li v-for="(area, index) in areas" :key="index" class="list-group-item">
            {{ area }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegionQuery',
  caseInfo: {
    title: '行政区划查询',
    description: '快速查询中国行政区划信息，支持省市区三级联动。',
    path: 'region'
  },
  data() {
    return {
      province: '北京',
      city: '北京市',
      areas: [],
      searched: false
    };
  },
  methods: {
    async queryArea() {
      this.searched = true;
      try {
        const res = await axios.get('https://hmajax.itheima.net/api/area', {
          params: {
            pname: this.province,
            cname: this.city
          }
        });
        this.areas = res.data.list;
      } catch (error) {
        console.error(error);
        this.areas = [];
      }
    }
  }
};
</script>

<style scoped>
.region-query-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.list-group {
  list-style: none;
  padding: 0;
}

.list-group-item {
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(0,0,0,.125);
  border-top-width: 0;
}

.list-group-item:first-child {
  border-top-width: 1px;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.list-group-item:last-child {
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.text-muted {
  color: #6c757d;
}

.text-danger {
  color: #dc3545;
}

.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-4 { margin-top: 1.5rem; }
</style>
