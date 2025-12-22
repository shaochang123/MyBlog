const db = require('./config/db');

console.log('正在尝试从连接池获取连接...');

db.getConnection((err, connection) => {
    if (err) {
        console.error('\n❌ 数据库连接失败！');
        console.error('错误代码:', err.code);
        console.error('错误信息:', err.message);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n👉 常见原因 (Ubuntu):');
            console.log('1. MySQL 的 root 用户默认使用 "auth_socket" 插件，不允许密码登录。');
            console.log('2. 用户名或密码确实错了。');
            console.log('3. "root"@"127.0.0.1" 用户不存在 (MySQL 区分 localhost 和 127.0.0.1)。');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('\n👉 常见原因: MySQL 服务未启动，或未监听 3306 端口。');
        }
        
        process.exit(1);
    } else {
        console.log('\n✅ 数据库连接成功！');
        console.log('正在执行测试查询...');
        
        connection.query('SELECT 1 as val', (err, results) => {
            connection.release(); // 释放连接
            
            if (err) {
                console.error('❌ 查询失败:', err.message);
                process.exit(1);
            } else {
                console.log(`✅ 查询成功。返回结果: ${results[0].val}`);
                console.log('数据库配置无误。');
                process.exit(0);
            }
        });
    }
});
