const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// 获取本地时间格式化为 YYYY-MM-DD HH:mm:ss（解决时区问题）
const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Buy ticket (Deduct points and add ticket)
router.post('/buy', (req, res) => {
    const { member_id, showtime_id } = req.body; // movie_id removed
    // 使用本地时间（已修复时区问题）
    const purchase_date = getLocalDateTime();

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

                // Normalize numeric types to avoid string-compare bugs
                const price = Number(showtimeResults[0].price);

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

                    const currentPoints = Number(results[0].points);
                    if (isNaN(currentPoints)) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Invalid member points value');
                        });
                    }

                    if (currentPoints < price) {
                        console.log('Insufficient points:', currentPoints, '<', price);
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
                            const sql = 'INSERT INTO tickets (ticket_id, member_id, purchase_date, showtime_id) VALUES (?, ?, ?, ?)';
                            connection.query(sql, [nextId, member_id, purchase_date, showtime_id], (err, result) => {
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
    console.log(`Attempting to refund ticket id=${id}`);

    db.getConnection((err, connection) => {
        if (err) {
            console.error('DB getConnection error (refund):', err);
            return res.status(500).send('DB connection error');
        }

        connection.beginTransaction(err => {
            if (err) {
                console.error('beginTransaction error (refund):', err);
                connection.release();
                return res.status(500).send('Transaction error');
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
                    console.error('Query error fetching ticket info:', { ticketId: id, err });
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Failed to fetch ticket info');
                    });
                }
                if (results.length === 0) {
                    console.warn('Ticket not found or showtime missing:', { ticketId: id });
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).send('Ticket not found or showtime missing');
                    });
                }

                const member_id = results[0].member_id;
                const priceRaw = results[0].price;
                const price = Number(priceRaw);

                if (Number.isNaN(price)) {
                    console.error('Invalid ticket price (not a number):', { ticketId: id, priceRaw });
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Invalid ticket price');
                    });
                }

                // Refund points
                connection.query('UPDATE members SET points = points + ? WHERE member_id = ?', [price, member_id], (err, updateRes) => {
                    if (err) {
                        console.error('Failed to refund points:', { ticketId: id, memberId: member_id, price, err });
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Failed to refund points');
                        });
                    }

                    // Insert recharge_record (refund)
                    const recordSql = 'INSERT INTO recharge_records (member_id, amount, type, create_time) VALUES (?, ?, "refund", NOW())';
                    connection.query(recordSql, [member_id, price], (err) => {
                        if (err) {
                            console.error('Failed to log refund record (non-fatal):', { ticketId: id, memberId: member_id, price, err });
                            // Do not abort transaction; proceed to marking ticket refunded
                        }

                        // First check ticket status to avoid double refunds
                        connection.query('SELECT status FROM tickets WHERE ticket_id = ?', [id], (err, rows) => {
                            if (err) {
                                console.error('Failed to select ticket status:', { ticketId: id, err });
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send('Failed to check ticket status');
                                });
                            }
                            if (rows.length === 0) {
                                console.warn('Ticket disappeared between queries:', { ticketId: id });
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(404).send('Ticket not found');
                                });
                            }

                            const currentStatus = rows[0].status;
                            if (currentStatus === 'refund') {
                                console.warn('Ticket already refunded:', { ticketId: id });
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(400).send('Ticket already refunded');
                                });
                            }

                            // Mark ticket as refunded (do not delete record)
                            connection.query('UPDATE tickets SET status = ? WHERE ticket_id = ?', ['refund', id], (err) => {
                                if (err) {
                                    console.error('Failed to update ticket status:', { ticketId: id, err });
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send('Failed to update ticket status');
                                    });
                                }

                                connection.commit(err => {
                                    if (err) {
                                        console.error('Commit error (refund):', err);
                                        return connection.rollback(() => {
                                            connection.release();
                                            res.status(500).send('Commit error');
                                        });
                                    }
                                    connection.release();
                                    req.io.emit('data-update');
                                    res.json({ message: 'Ticket refunded and points refunded' });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;