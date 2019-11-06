var mysql = require('mysql');
var util = require('util');

var pool = mysql.createPool({
    connectionLimit: 100,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host: '192.110.110.72',
    user: 'xiang',
    password: '@Jepara68',
    database: 'bakoelgame'
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release(); console.log("database connected");
    return
});

pool.query = util.promisify(pool.query) // Magic happens here.

module.exports = pool;