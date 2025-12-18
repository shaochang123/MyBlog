const mysql = require('mysql2');

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
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