const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Get all movies with complex stats (Join, Aggregation, Subquery)
router.get('/', (req, res) => {
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
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a movie
router.post('/', (req, res) => {
    const { title, director, duration } = req.body;
    getNextId('movies', 'movie_id', 101, (err, nextId) => {
        if (err) return res.status(500).send(err);
        
        const sql = 'INSERT INTO movies (movie_id, title, director, duration) VALUES (?, ?, ?, ?)';
        db.query(sql, [nextId, title, director, duration], (err, result) => {
            if (err) return res.status(500).send(err);
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