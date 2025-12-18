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
    const sql = 'DELETE FROM members WHERE member_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        req.io.emit('data-update');
        res.json({ message: 'Member deleted' });
    });
});

// Recharge points
router.post('/:id/recharge', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const sql = 'UPDATE members SET points = points + ? WHERE member_id = ?';
    db.query(sql, [amount, id], (err, result) => {
        if (err) return res.status(500).send(err);
        req.io.emit('data-update');
        res.json({ message: 'Points recharged' });
    });
});

// Get tickets for a member
router.get('/:id/tickets', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT t.ticket_id, m.title, t.price, t.purchase_date 
        FROM tickets t 
        JOIN movies m ON t.movie_id = m.movie_id 
        WHERE t.member_id = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

module.exports = router;