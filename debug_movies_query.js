const db = require('./server/config/db');

const sql = `
    SELECT m.*, 
           COALESCE(AVG(s.price), 0) as avg_price,
           COUNT(t.ticket_id) as ticket_count,
           (SELECT AVG(price) FROM showtimes) as global_avg_price
    FROM movies m
    LEFT JOIN tickets t ON m.movie_id = t.movie_id
    LEFT JOIN ticket_showtime ts ON t.ticket_id = ts.ticket_id
    LEFT JOIN showtimes s ON ts.showtime_id = s.id
    GROUP BY m.movie_id
`;

console.log('Executing query...');
db.query(sql, (err, results) => {
    if (err) {
        console.error('Query failed:', err);
    } else {
        console.log('Query success. Results:', results);
    }
    process.exit();
});
