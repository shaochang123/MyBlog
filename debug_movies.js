const db = require('./server/config/db');

console.log('Checking movies table structure...');
db.query('DESCRIBE movies', (err, results) => {
    if (err) {
        console.error('Error describing movies table:', err);
    } else {
        console.log('Movies table structure:');
        console.table(results);
    }
    process.exit();
});
