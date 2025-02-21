//This file handles the ticket purchases and DB updates from it. SQL query to insert purchased tickets into tickets table. 
//Checks for valid userID & eventID used to purchase the tickets

const express = require('express');
const db = require('../models/db'); // database connection file
const router = express.Router();


// Purchase Tickets Route, POST API sendig email, event and number of tickets requested. Default 100 tickets per event. 
router.post('/purchase', (req, res) => {
    const { userId, eventId, quantity } = req.body;
    console.log("Purchase API Initiated");

    if (!userId) {
        return res.status(400).json({ message: "Invalid UserID" });
    }
    if (!eventId) {
        return res.status(401).json({ message: "Invalid Event ID(Debug BAckend)" });
    }
    if (!quantity) {
        return res.status(402).json({ message: "Invalid Quantity (default set to 100 limit)" });
    }
//SQL Query for adding tickets to user account
    db.query("INSERT INTO tickets (user_id, event_id, quantity) VALUES (?, ?, ?)", 
        [userId, eventId, quantity], 
        (err, result) => {
            if (err) {
                console.error("(Check SQL insertion)Database Error:", err);
                return res.status(500).json({ message: "Error purchasing tickets(INsertion to SQL Table)" });
            }
            res.json({ message: "Tickets purchased successfully!" });
        }
    );
});

module.exports = router;
