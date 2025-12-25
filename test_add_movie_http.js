const http = require('http');

const data = JSON.stringify({
    title: 'Test Movie HTTP',
    director: 'Test Director',
    duration: 120
});

const options = {
    hostname: 'localhost',
    port: 3300,
    path: '/api/movies',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);
    
    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
