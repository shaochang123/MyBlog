const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/db');

const app = express();
const port = 3300;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"]
    }
});

// Initialize Stats Table
const initStats = () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS site_stats (
            id INT PRIMARY KEY,
            total_visits INT DEFAULT 0
        )
    `;
    db.query(createTable, (err) => {
        if (err) console.error('Stats table init error:', err);
        else {
            db.query('INSERT IGNORE INTO site_stats (id, total_visits) VALUES (1, 0)');
        }
    });
};
initStats();

// Helper to broadcast stats
const broadcastStats = () => {
    db.query('SELECT total_visits FROM site_stats WHERE id = 1', (err, results) => {
        if (!err && results.length > 0) {
            const stats = {
                totalVisits: results[0].total_visits,
                onlineUsers: io.engine.clientsCount
            };
            io.emit('stats-update', stats);
        }
    });
};

io.on('connection', (socket) => {
    // Send current stats immediately upon connection
    broadcastStats();

    // Only increment if client sends 'new-visit' event
    socket.on('new-visit', () => {
        db.query('UPDATE site_stats SET total_visits = total_visits + 1 WHERE id = 1', (err) => {
            if (!err) broadcastStats();
        });
    });

    socket.on('disconnect', () => {
        broadcastStats();
    });
});

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/movies', require('./routes/movies'));
app.use('/api/members', require('./routes/members'));
app.use('/api/tickets', require('./routes/tickets'));

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
