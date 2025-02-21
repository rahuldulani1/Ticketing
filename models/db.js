const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // SQL User name harcoded
    password: '9248',  // Local MYSQL password
    database: 'ticketing_service',
    ssl: false
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("MySQL Connected...");
});

module.exports = db; 
