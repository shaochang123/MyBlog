const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1) Hot movies: ticket_count > average ticket_count (across movies)
router.get('/hot', (req, res) => {
    const sql = `
        SELECT m.*,
               (
                 SELECT COUNT(t.ticket_id)
                 FROM showtimes s
                 JOIN tickets t ON t.showtime_id = s.id
                 WHERE s.movie_id = m.movie_id
               ) AS ticket_count,
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
        )
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2) Movies with avg price > global avg price
router.get('/above_avg_price', (req, res) => {
    const sql = `
        SELECT m.*,
               (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) as avg_price,
               (SELECT COALESCE(AVG(price),0) FROM showtimes) as global_avg_price
        FROM movies m
        WHERE (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) > (SELECT COALESCE(AVG(price),0) FROM showtimes)
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3) Search movies (title/director) with basic relevance
router.get('/search', (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q is required' });
    const like = `%${q}%`;
    const sql = `
        SELECT m.*,
               (SELECT COALESCE(AVG(price),0) FROM showtimes WHERE movie_id = m.movie_id) as avg_price,
               (SELECT COUNT(t.ticket_id) FROM showtimes s JOIN tickets t ON t.showtime_id = s.id WHERE s.movie_id = m.movie_id) as ticket_count
        FROM movies m
        WHERE m.title LIKE ? OR m.director LIKE ?
        ORDER BY (m.title LIKE ?) DESC, (m.director LIKE ?) DESC, m.title ASC
        LIMIT ?
    `;
    const limit = parseInt(req.query.limit) || 50;
    db.query(sql, [like, like, like, like, limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 4) Top selling movies in last N days
router.get('/top_selling', (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 10;
    const sql = `
        SELECT m.movie_id, m.title, COUNT(t.ticket_id) AS sold
        FROM movies m
        JOIN showtimes s ON s.movie_id = m.movie_id
        JOIN tickets t ON t.showtime_id = s.id
        WHERE t.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY m.movie_id
        ORDER BY sold DESC
        LIMIT ?
    `;
    db.query(sql, [days, limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 5) Revenue per movie
router.get('/revenue_by_movie', (req, res) => {
    const sql = `
        SELECT m.movie_id, m.title, COALESCE(SUM(s.price),0) AS revenue
        FROM movies m
        JOIN showtimes s ON s.movie_id = m.movie_id
        JOIN tickets t ON t.showtime_id = s.id
        GROUP BY m.movie_id
        ORDER BY revenue DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 6) Member spend ranking (total payments)
router.get('/member_spend', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const sql = `
        SELECT mem.member_id, mem.name, COALESCE(SUM(rr.amount),0) AS total_spent
        FROM members mem
        LEFT JOIN recharge_records rr ON rr.member_id = mem.member_id AND rr.type = 'payment'
        GROUP BY mem.member_id
        ORDER BY total_spent DESC
        LIMIT ?
    `;
    db.query(sql, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 7) Popular halls by ticket count
router.get('/popular_halls', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const sql = `
        SELECT h.id, h.name, COUNT(t.ticket_id) AS ticket_count
        FROM halls h
        JOIN showtimes s ON s.hall_id = h.id
        JOIN tickets t ON t.showtime_id = s.id
        GROUP BY h.id
        ORDER BY ticket_count DESC
        LIMIT ?
    `;
    db.query(sql, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 8) Showtimes occupancy (sold / seat_count)
router.get('/showtime_occupancy', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const sql = `
        SELECT s.id, s.start_time, h.name AS hall_name, COUNT(t.ticket_id) AS sold, h.seat_count,
               (COUNT(t.ticket_id) / NULLIF(h.seat_count,0)) * 100 AS occupancy_pct
        FROM showtimes s
        JOIN halls h ON s.hall_id = h.id
        LEFT JOIN tickets t ON t.showtime_id = s.id
        GROUP BY s.id
        ORDER BY occupancy_pct DESC
        LIMIT ?
    `;
    db.query(sql, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 9) Movies without showtimes
router.get('/no_showtimes', (req, res) => {
    const sql = `
        SELECT m.*
        FROM movies m
        LEFT JOIN showtimes s ON s.movie_id = m.movie_id
        WHERE s.id IS NULL
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
