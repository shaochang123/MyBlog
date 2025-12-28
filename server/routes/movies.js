const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Get all movies with complex stats (Join, Aggregation, Subquery)
router.get('/', (req, res) => {
    const hot = req.query.hot === '1' || req.query.hot === 'true';
    const aboveAvg = req.query.above_avg_price === '1' || req.query.above_avg_price === 'true';
    const q = (req.query.q || '').trim();

    let whereClauses = [];
    const params = [];

    if (hot) {
        whereClauses.push(`(
            SELECT COUNT(t.ticket_id)
            FROM showtimes s
            JOIN tickets t ON t.showtime_id = s.id
            WHERE s.movie_id = m.movie_id
        ) > (
            SELECT COALESCE(AVG(cnt),0) FROM (
                SELECT COUNT(t2.ticket_id) AS cnt
                FROM showtimes s2
                JOIN tickets t2 ON t2.showtime_id = s2.id
                GROUP BY s2.movie_id
            ) AS sub
        )`);
    }

    if (aboveAvg) {
        whereClauses.push(`(
            SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id
        ) > (
            SELECT COALESCE(AVG(price),0) FROM showtimes
        )`);
    }

    if (q) {
        whereClauses.push(`(m.title LIKE ? OR m.director LIKE ?)`);
        params.push(`%${q}%`, `%${q}%`);
    }

    // Single full-SQL per feature (keeps each functionality self-contained)
    if (q) {
        const limit = parseInt(req.query.limit) || 50;
        const like = `%${q}%`;
        const sql = `
            SELECT m.*,
                   (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) AS avg_price,
                   (SELECT COUNT(t.ticket_id) FROM showtimes s JOIN tickets t ON t.showtime_id = s.id WHERE s.movie_id = m.movie_id) AS ticket_count
            FROM movies m
            WHERE m.title LIKE ? OR m.director LIKE ?
            ORDER BY m.movie_id
            LIMIT ?
        `;
        return db.query(sql, [like, like, limit], (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    }

    if (hot) {
        const sql = `
            SELECT m.*,
                   (SELECT COUNT(t.ticket_id) FROM showtimes s JOIN tickets t ON t.showtime_id = s.id WHERE s.movie_id = m.movie_id) AS ticket_count,
                   (
                     SELECT COALESCE(AVG(cnt),0) FROM (
                       SELECT COUNT(t2.ticket_id) AS cnt
                       FROM showtimes s2
                       JOIN tickets t2 ON t2.showtime_id = s2.id
                       GROUP BY s2.movie_id
                     ) AS sub
                   ) AS avg_ticket_count
            FROM movies m
            WHERE (
              SELECT COUNT(t.ticket_id) FROM showtimes s JOIN tickets t ON t.showtime_id = s.id WHERE s.movie_id = m.movie_id
            ) > (
              SELECT COALESCE(AVG(cnt),0) FROM (
                SELECT COUNT(t2.ticket_id) AS cnt
                FROM showtimes s2
                JOIN tickets t2 ON t2.showtime_id = s2.id
                GROUP BY s2.movie_id
              ) AS sub
            )
            ORDER BY m.movie_id
        `;
        return db.query(sql, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    }

    if (aboveAvg) {
        const sql = `
            SELECT m.*,
                   (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) AS avg_price,
                   (SELECT COALESCE(AVG(price),0) FROM showtimes) AS global_avg_price
            FROM movies m
            WHERE (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) > (SELECT COALESCE(AVG(price),0) FROM showtimes)
            ORDER BY m.movie_id
        `;
        return db.query(sql, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    }

    // Default: full list (single SQL)
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
        ORDER BY m.movie_id
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