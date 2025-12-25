const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getNextId } = require('../utils/helper');

// Get all members
router.get('/', (req, res) => {
    db.query('SELECT * FROM members', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a member
router.post('/', (req, res) => {
    const { name, gender, points } = req.body;
    const genderChar = gender === 'Male' ? 'M' : 'F';
    
    getNextId('members', 'member_id', 2001, (err, nextId) => {
        if (err) return res.status(500).send(err);

        const sql = 'INSERT INTO members (member_id, name, gender, points) VALUES (?, ?, ?, ?)';
        db.query(sql, [nextId, name, genderChar, points || 0], (err, result) => {
            if (err) return res.status(500).send(err);
            req.io.emit('data-update');
            res.json({ message: 'Member added', id: nextId });
        });
    });
});

// Delete a member
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Manually delete related records to handle missing ON DELETE CASCADE
    const deleteTickets = 'DELETE FROM tickets WHERE member_id = ?';
    const deleteRecharge = 'DELETE FROM recharge_records WHERE member_id = ?';
    const deleteMember = 'DELETE FROM members WHERE member_id = ?';

    db.getConnection((err, connection) => {
        if (err) return res.status(500).send(err);

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).send(err);
            }

            connection.query(deleteTickets, [id], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send(err);
                    });
                }
                
                connection.query(deleteRecharge, [id], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send(err);
                        });
                    }

                    connection.query(deleteMember, [id], (err, result) => {
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
                            res.json({ message: 'Member deleted' });
                        });
                    });
                });
            });
        });
    });
});

// Recharge points
router.post('/:id/recharge', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const sql = 'UPDATE members SET points = points + ? WHERE member_id = ?';
    const sql2 = 'INSERT INTO recharge_records (member_id, amount, type, create_time) VALUES (?, ?, "recharge", NOW())';
    db.query(sql, [amount, id], (err, result) => {
        if (err) return res.status(500).send(err);
        req.io.emit('data-update');
        res.json({ message: 'Points recharged' });
    });
    db.query(sql2, [id, amount], (err, result) => {
        if (err) console.error('Recharge record error:', err);

    });
});

// Get tickets for a member
router.get('/:id/tickets', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT t.ticket_id, m.title, s.price, t.purchase_date, h.name as hall_name, s.start_time, t.status
        FROM tickets t 
        JOIN movies m ON t.movie_id = m.movie_id 
        JOIN showtimes s ON t.showtime_id = s.id
        JOIN halls h ON s.hall_id = h.id
        WHERE t.member_id = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

module.exports = router;