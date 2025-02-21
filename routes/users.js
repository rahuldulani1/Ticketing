
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db'); // database connection file
const router = express.Router();
require('dotenv').config(); //variables stored here

 /* User Registration and user input validation
    Validation Checks:
    1. All fields are present (Email, name, Password)
    2.Check if Email already in table
*/
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Registering new user:", email);

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required. Please enter All fields or enter missing fields" });
    }

    try {
        
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            // Check All fields entered by user
            if (err) {
                console.error("Database error while checking email:", err);
                return res.status(500).json({ message: "Internal server error." });
            }
            // Check If email already in users Table
            if (result.length > 0) {
                console.warn("Email already exists:", email);
                return res.status(409).json({ message: "Email already registered. Please login instead." });
            }

            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            //Insert new user into the users table
            db.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
                [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                console.log("User Registered Successfully!");
                res.json({ message: "User Registered Successfully!" });
            });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});


/* User Login
    Input Validation:
    1.Checks email and password were both entered.
    2.Check in SQL Table is user email exists. 
    3.Checks is password_hash eexists for user in table.
    4.compares user entered password with stored password. 

*/
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("Received login request for:", email);
    
    if (!email || !password) {
        console.error("Missing email or password.");
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length === 0) {
            console.warn("User not found:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result[0];
        console.log("User found in database:", user);

        if (!user.password_hash) {
            console.error("Missing password_hash for user:", email);
            return res.status(500).json({ message: "User record is missing password hash" });
        }

        console.log("Comparing input password:", password, "with stored hash:", user.password_hash);

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            console.log("Password comparison result:", isPasswordValid);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            console.log("Login successful! Sending response...");
            res.json({ message: "Login successful!", user: { id: user.id, name: user.name, email: user.email } });

        } catch (bcryptError) {
            console.error("bcrypt error:", bcryptError);
            return res.status(500).json({ message: "Error processing password" });
        }
    });
});


// My Account API
router.post('/my-account', async (req, res) => {
    console.log("Incoming /my-account request:", req.body); //check for what API is recieveing 

    const { email } = req.body;

    if (!email) {
        console.error("Error: Email is required.");
        return res.status(400).json({ message: "Email is required." });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length === 0) {
            console.warn("User not found:", email);
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];

        db.query(
            "SELECT t.quantity, t.purchase_date, e.title AS event_name, e.date AS event_date, e.price AS event_price " +
            "FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.user_id = ?",
            [user.id],
            (err, ticketResult) => {
                if (err) {
                    console.error("error fetching tickets:", err);
                    return res.status(500).json({ message: "Error retrieving tickets" });
                }

                console.log("Tickets found:", ticketResult);

                res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    tickets: ticketResult
                });
            }
        );
    });
});


module.exports = router;
