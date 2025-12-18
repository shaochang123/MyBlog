const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

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
