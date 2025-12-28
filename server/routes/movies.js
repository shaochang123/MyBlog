const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Get all movies with complex stats (Join, Aggregation, Subquery)
router.get('/', (req, res) => {
    // 通过 tickets.showtime_id 直接关联 showtimes 获取价格
    // 注意：这里使用 LEFT JOIN 确保即使没有票也能查出电影
    const sql = `
        SELECT m.*, 
               (SELECT COALESCE(AVG(price), 0) FROM showtimes WHERE movie_id = m.movie_id) as avg_price,
               (SELECT COUNT(t.ticket_id) FROM showtimes s JOIN tickets t ON t.showtime_id = s.id WHERE s.movie_id = m.movie_id) as ticket_count,
               (
                 SELECT COALESCE(AVG(cnt), 0) FROM (
                   SELECT COUNT(t2.ticket_id) AS cnt
                   FROM showtimes s2
                   JOIN tickets t2 ON t2.showtime_id = s2.id
                   GROUP BY s2.movie_id
                 ) AS sub
               ) AS avg_ticket_count,
               (SELECT AVG(price) FROM showtimes) as global_avg_price
        FROM movies m
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a movie
router.post('/', (req, res) => {
    const { title, director, duration } = req.body;
    
    if (!title || !director) {
        return res.status(400).json({ error: 'Title and Director are required' });
    }

    const durationInt = parseInt(duration) || 0;

    getNextId('movies', 'movie_id', 101, (err, nextId) => {
        if (err) {
            console.error('Error getting next ID:', err);
            return res.status(500).send(err);
        }
        
        const sql = 'INSERT INTO movies (movie_id, title, director, duration) VALUES (?, ?, ?, ?)';
        db.query(sql, [nextId, title, director, durationInt], (err, result) => {
            if (err) {
                console.error('Error adding movie:', err);
                return res.status(500).send(err);
            }
            req.io.emit('data-update');
            res.json({ message: 'Movie added', id: nextId });
        });
    });
});

// Delete a movie
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM movies WHERE movie_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        req.io.emit('data-update');
        res.json({ message: 'Movie deleted' });
    });
});

module.exports = router;