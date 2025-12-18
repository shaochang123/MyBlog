const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Get all movies
router.get('/', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
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