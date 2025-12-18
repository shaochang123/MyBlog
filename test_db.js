const mysql = require('mysql2');

console.log('Testing DB connection to localhost...');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306, // Default MySQL port
    user: 'root',
    password: '23123690', // Assuming same password
    database: 'lzy'
});

connection.connect(err => {
    if (err) {
        console.error('Connection failed:', err);
        return;
    }
    console.log('Connected!');

    connection.query('SELECT * FROM movies', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Movies found:', results.length);
        }
        connection.end();
    });
});