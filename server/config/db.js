const mysql = require('mysql2');

// 自动判断环境：如果是 Linux (Ubuntu)，使用 'lzy_admin'，否则使用 'root'
// 这样可以兼容本地开发 (Windows) 和服务器部署 (Ubuntu)
const dbUser = process.platform === 'linux' ? 'lzy_admin' : 'root';

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: dbUser,
    password: '23123690',
    database: 'lzy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Pool events
db.on('connection', (connection) => {
    console.log('DB Connection established');
});

db.on('error', (err) => {
    console.error('DB Pool Error:', err);
});

module.exports = db;