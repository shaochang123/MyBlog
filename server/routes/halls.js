const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取所有影厅
router.get('/', (req, res) => {
    db.query('SELECT * FROM halls', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 添加影厅
router.post('/', (req, res) => {
    const { name, type, seat_count } = req.body;
    const sql = 'INSERT INTO halls (name, type, seat_count) VALUES (?, ?, ?)';
    db.query(sql, [name, type, seat_count], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name, type, seat_count });
    });
});

// 删除影厅
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM halls WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
