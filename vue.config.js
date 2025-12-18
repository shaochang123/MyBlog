module.exports = {
  //...
  devServer: {
    historyApiFallback: true, // 解决前端路由刷新404问题
    allowedHosts: "all",
    proxy: {
      '/api': {
        target: 'http://localhost:3300',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3300',
        ws: true,
        changeOrigin: true
      }
    }
  },
};
