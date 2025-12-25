const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Buy ticket (Deduct points and add ticket)
router.post('/buy', (req, res) => {
    const { member_id, movie_id, showtime_id } = req.body;
    // Format date as YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const purchase_date = now.toISOString().slice(0, 19).replace('T', ' ');

    // Start transaction
    db.getConnection((err, connection) => {
        if (err) return res.status(500).send(err);

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).send(err);
            }

            // 1. Get price from showtimes
            connection.query('SELECT price FROM showtimes WHERE id = ?', [showtime_id], (err, showtimeResults) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send(err);
                    });
                }
                if (showtimeResults.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).send('Showtime not found');
                    });
                }

                const price = showtimeResults[0].price;

                // 2. Check points
                connection.query('SELECT points FROM members WHERE member_id = ?', [member_id], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send(err);
                        });
                    }
                    if (results.length === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).send('Member not found');
                        });
                    }

                    const currentPoints = results[0].points;
                    if (currentPoints < price) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(400).send('Insufficient points');
                        });
                    }

                    // 3. Deduct points
                    connection.query('UPDATE members SET points = points - ? WHERE member_id = ?', [price, member_id], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send(err);
                            });
                        }

                        // 4. Get next ticket ID
                        getNextId('tickets', 'ticket_id', 1, (err, nextId) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send(err);
                                });
                            }

                            // 5. Insert ticket (WITHOUT price)
                            const sql = 'INSERT INTO tickets (ticket_id, member_id, movie_id, purchase_date, showtime_id) VALUES (?, ?, ?, ?, ?)';
                            connection.query(sql, [nextId, member_id, movie_id, purchase_date, showtime_id], (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send(err);
                                    });
                                }

                                // 6. Insert recharge_record (payment)
                                const recordSql = 'INSERT INTO recharge_records (member_id, amount, type, create_time) VALUES (?, ?, "payment", ?)';
                                connection.query(recordSql, [member_id, price, purchase_date], (err) => {
                                    if (err) {
                                        // Log error but don't fail transaction for this (optional)
                                        console.error('Failed to log payment record:', err);
                                    }
                                    
                                    connection.commit(err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(500).send(err);
                                            });
                                        }
                                        connection.release();
                                        req.io.emit('data-update');
                                        res.json({ message: 'Ticket purchased successfully', ticket_id: nextId });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Delete a ticket (Refund points and remove ticket)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.getConnection((err, connection) => {
        if (err) return res.status(500).send(err);

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).send(err);
            }

            // Get ticket info to refund points (Join with showtimes to get price)
            const sql = `
                SELECT t.member_id, s.price 
                FROM tickets t
                JOIN showtimes s ON t.showtime_id = s.id
                WHERE t.ticket_id = ?
            `;
            connection.query(sql, [id], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send(err);
                    });
                }
                if (results.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).send('Ticket not found');
                    });
                }

                const { member_id, price } = results[0];

                // Refund points
                connection.query('UPDATE members SET points = points + ? WHERE member_id = ?', [price, member_id], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send(err);
                        });
                    }

                    // Insert recharge_record (refund)
                    const recordSql = 'INSERT INTO recharge_records (member_id, amount, type, create_time) VALUES (?, ?, "refund", NOW())';
                    connection.query(recordSql, [member_id, price], (err) => {
                         if (err) console.error('Failed to log refund record:', err);

                        // Delete ticket
                        connection.query('DELETE FROM tickets WHERE ticket_id = ?', [id], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send(err);
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send(err);
                                    });
                                }
                                connection.release();
                                req.io.emit('data-update');
                                res.json({ message: 'Ticket deleted and points refunded' });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;