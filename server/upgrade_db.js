const db = require('./config/db');

const upgradeQueries = [
    // 1. 创建影厅表
    `CREATE TABLE IF NOT EXISTS halls (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(20) DEFAULT '2D',
        seat_count INT DEFAULT 0
    )`,

    // 2. 创建排片表
    `CREATE TABLE IF NOT EXISTS showtimes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        movie_id INT NOT NULL,
        hall_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
        FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
    )`,

    // 3. 创建充值记录表
    `CREATE TABLE IF NOT EXISTS recharge_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        member_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type ENUM('recharge', 'payment', 'refund') NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    )`,

    // 4. 修改 tickets 表 (添加 showtime_id, seat_info, status)
    // 注意：这里假设 tickets 表已经存在。如果不存在会报错，所以最好先检查列是否存在。
    // 为了简化，我们尝试添加列，如果列已存在 MySQL 会报错但我们可以忽略或用存储过程。
    // 这里使用简单的 ALTER IGNORE 逻辑不太容易，我们直接尝试添加。
    `ALTER TABLE tickets ADD COLUMN showtime_id INT`,
    `ALTER TABLE tickets ADD COLUMN seat_info VARCHAR(50)`,
    `ALTER TABLE tickets ADD COLUMN status ENUM('valid', 'used', 'refunded') DEFAULT 'valid'`,
    
    // 5. 尝试添加外键 (如果 showtime_id 添加成功)
    `ALTER TABLE tickets ADD CONSTRAINT fk_ticket_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id)`
];

const runUpgrade = async () => {
    console.log('开始数据库升级...');
    
    for (const query of upgradeQueries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    // 忽略 "Duplicate column name" 错误 (错误码 1060)
                    if (err && err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            console.log('执行成功:', query.substring(0, 50) + '...');
        } catch (err) {
            console.error('执行失败:', query.substring(0, 50) + '...', err.message);
        }
    }
    
    console.log('数据库升级完成！');
    process.exit(0);
};

runUpgrade();
