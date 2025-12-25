const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取所有排片 (包含电影名和影厅名)
router.get('/', (req, res) => {
    const sql = `
        SELECT s.*, m.title as movie_title, h.name as hall_name 
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN halls h ON s.hall_id = h.id
        ORDER BY s.start_time DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 根据电影ID获取排片
router.get('/movie/:movieId', (req, res) => {
    const sql = `
        SELECT s.*, h.name as hall_name 
        FROM showtimes s
        JOIN halls h ON s.hall_id = h.id
        WHERE s.movie_id = ? AND s.start_time > NOW()
        ORDER BY s.start_time ASC
    `;
    db.query(sql, [req.params.movieId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 添加排片
router.post('/', (req, res) => {
    const { movie_id, hall_id, start_time, price } = req.body;
    // 简单计算结束时间 (假设默认2小时，实际应从电影表获取时长)
    // 这里简化处理，只存开始时间
    const sql = 'INSERT INTO showtimes (movie_id, hall_id, start_time, price) VALUES (?, ?, ?, ?)';
    db.query(sql, [movie_id, hall_id, start_time, price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// 删除排片
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM showtimes WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
