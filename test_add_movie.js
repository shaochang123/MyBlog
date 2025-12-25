const axios = require('axios');

const movie = {
    title: 'Test Movie',
    director: 'Test Director',
    duration: 120
};

axios.post('http://localhost:3300/api/movies', movie)
    .then(res => {
        console.log('Success:', res.data);
    })
    .catch(err => {
        console.error('Error:', err.response ? err.response.data : err.message);
        console.error('Status:', err.response ? err.response.status : 'No status');
    });
