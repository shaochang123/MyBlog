const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取所有交易记录
router.get('/', (req, res) => {
    const sql = `
        SELECT r.*, m.name as member_name
        FROM recharge_records r
        LEFT JOIN members m ON r.member_id = m.member_id
        ORDER BY r.create_time DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
