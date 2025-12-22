const db = require('./config/db');

console.log('正在测试电影列表查询...');

const sql = `
    SELECT m.*, 
           COALESCE(AVG(t.price), 0) as avg_price,
           COUNT(t.ticket_id) as ticket_count,
           (SELECT AVG(price) FROM tickets) as global_avg_price
    FROM movies m
    LEFT JOIN tickets t ON m.movie_id = t.movie_id
    GROUP BY m.movie_id
`;

db.query(sql, (err, results) => {
    if (err) {
        console.error('\n❌ 查询失败！');
        console.error('错误代码:', err.code);
        console.error('错误信息:', err.sqlMessage || err.message);
        
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n👉 原因: 数据库中缺少表。请检查 "movies" 和 "tickets" 表是否存在。');
        } else if (err.code === 'ER_BAD_FIELD_ERROR') {
            console.log('\n👉 原因: 表中缺少字段。请检查 SQL 中使用的列名是否正确。');
        } else if (err.code === 'ER_WRONG_FIELD_WITH_GROUP') {
            console.log('\n👉 原因: MySQL 的 ONLY_FULL_GROUP_BY 模式限制。');
            console.log('尝试修改 SQL，明确列出所有 SELECT 的字段，或者修改 MySQL 配置。');
        }
        process.exit(1);
    } else {
        console.log('\n✅ 查询成功！');
        console.log(`获取到 ${results.length} 条电影数据。`);
        if (results.length > 0) {
            console.log('第一条数据示例:', results[0]);
        }
        process.exit(0);
    }
});
