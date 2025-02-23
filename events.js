//This handles SQL queries to search events by event name. 
const express = require("express"); //Import express framework
const router = express.Router(); //create handler for handling routes
const db = require("../config"); // Database connection route to config file

//GET path fro searching events
router.get("/", (req, res) => {
    const { search } = req.query; // Capture search query from frontend
    //Define SQL query for all events
    let query = "SELECT * FROM events";
    //empty array to hold query parameters
    let params = [];

    //Search for user input event name in events table
    if (search) {
        query += " WHERE title LIKE ?"; //placeholder
        params.push(`%${search}%`); //allow for partial search words
    }

    db.query(query, params, (err, results) => {
        //Error handling
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ message: "Database error" });
        }
        //return results 
        res.json(results);
    });
});

//log message that indicates events route has been loaded
console.log("Events route has been loaded");
module.exports = router;

