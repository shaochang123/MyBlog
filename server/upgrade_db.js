const db = require('./config/db');

const upgradeQueries = [
    // 1. 创建影厅表
    `CREATE TABLE IF NOT EXISTS halls (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
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

    // 4. 为 tickets 表添加 showtime_id 字段（如果不存在）
    `ALTER TABLE tickets ADD COLUMN showtime_id INT, 
     ADD CONSTRAINT fk_tickets_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE`,
    `ALTER TABLE tickets DROP COLUMN seat_info`,
    // Ensure hall names are unique (adds index if not exists)
    `ALTER TABLE halls ADD UNIQUE INDEX idx_halls_name (name)`,
    // Backfill tickets.showtime_id from existing tickets.movie_id when possible
    `UPDATE tickets t SET showtime_id = (
        SELECT id FROM showtimes s WHERE s.movie_id = t.movie_id ORDER BY id LIMIT 1
    ) WHERE t.showtime_id IS NULL AND t.movie_id IS NOT NULL`,
    // Remove movie_id FK and column from tickets if they exist. Try common FK names first,
    // then drop the column after FKs are removed.
    `ALTER TABLE tickets DROP FOREIGN KEY fk_tickets_movie`,
    `ALTER TABLE tickets DROP FOREIGN KEY movie_id1`,
    `ALTER TABLE tickets DROP COLUMN movie_id`,
];

const runUpgrade = async () => {
    console.log('开始数据库升级...');
    
    for (const query of upgradeQueries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    // 忽略一些常见可安全忽略的错误：
                    // - Duplicate column name (1060)
                    // - Duplicate index (ER_DUP_FIELDNAME)
                    // - Can't DROP ... (1091 / ER_CANT_DROP_FIELD_OR_KEY)
                    if (err && err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1091 && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
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

// 在执行升级前，动态检查并插入删除 tickets.movie_id 的外键（若存在）
const ensureDynamicDrops = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'movie_id' AND REFERENCED_TABLE_NAME IS NOT NULL`;
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            const names = results.map(r => r.CONSTRAINT_NAME).filter(Boolean);
            if (names.length === 0) return resolve(names);
            const dropIdx = upgradeQueries.findIndex(q => q.includes("ALTER TABLE tickets DROP COLUMN movie_id"));
            names.forEach(name => {
                const dropQuery = `ALTER TABLE tickets DROP FOREIGN KEY ${name}`;
                if (!upgradeQueries.includes(dropQuery)) {
                    upgradeQueries.splice(dropIdx, 0, dropQuery);
                }
            });
            resolve(names);
        });
    });
};

ensureDynamicDrops().then(names => {
    if (names.length) console.log('发现并将删除 FK 约束:', names.join(', '));
    runUpgrade();
}).catch(err => {
    console.error('检查外键时出错，继续执行升级脚本：', err.message);
    runUpgrade();
});
