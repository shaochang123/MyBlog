const db = require('../config/db');

const getNextId = (table, idColumn, minId, callback) => {
    db.query(`SELECT MAX(${idColumn}) as maxId FROM ${table}`, (err, results) => {
        if (err) return callback(err);
        let nextId = (results[0].maxId || 0) + 1;
        if (nextId < minId) {
            nextId = minId;
        }
        callback(null, nextId);
    });
};

module.exports = { getNextId };