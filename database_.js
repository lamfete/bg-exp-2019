var mysql = require('mysql');
var util = require('util');

// create connection to database
const dbWrite = mysql.createConnection({
    host: '192.110.110.72',
    user: 'xiang',
    password: '@Jepara68',
    database: 'bakoelgame'
});

const dbRead = mysql.createConnection({
    host: '192.110.110.73',
    user: 'xiang',
    password: '@Jepara68',
    database: 'bakoelgame'
});

// connect to database
dbWrite.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('Connected to database write yudistira');    
});
global.dbWrite = dbWrite;

dbRead.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('Connected to database read bima');    
});
global.dbRead = dbRead;
global.dbWrite = dbWrite;