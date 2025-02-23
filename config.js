//Configuration File

//Import mysql2 
const mysql = require("mysql2");

//Database Connection Variables
const db = mysql.createConnection({
    host: "localhost",  //Server Address
    user: "root",       //Username for database         
    password: "9248",    //SQL server user password
    database: "ticketing_service", //Database name
    ssl: false
});

//Command to start SQL Connection
db.connect(err => {
    //Error handling 
    if (err) {
        console.error("(Config.js)The Connection To Database has failed:", err);
        return;
    }
    //Connection confirmation message
    console.log("MySQL Connected!");
});

module.exports = db;
