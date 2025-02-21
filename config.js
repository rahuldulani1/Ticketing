const mysql = require("mysql2");

//Database Connection Variables
const db = mysql.createConnection({
    host: "localhost",
    user: "root",         
    password: "9248",    
    database: "ticketing_service",
    ssl: false
});

//Command to start SQL Connection
db.connect(err => {
    if (err) {
        console.error("The Connection To Database has failed:", err);
        return;
    }
    console.log("MySQL Connected!");
});

module.exports = db;
