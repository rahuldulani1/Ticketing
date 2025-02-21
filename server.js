//Main Backend File. This File Starts the SQL Server, loads the routes for the three SQL tables and also initiates express. 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
// Importing route handlers here
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets'); 
const app = express();
app.use(cors());
app.use(express.json());

//MySQL connection and parameters
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9248',
    database: 'ticketing_service',
    ssl: false
});

db.connect(err => {
    if (err) {
        console.error("Connection to DB failed:", err);
        return;
    }
    console.log("MySQL Connected!");
});

// Using the Routes files
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes); 

// MyAccout page API
app.post('/api/users/my-account', (req, res) => {
    const { email } = req.body;
    console.log("myaccount API Initiated");
    if (!email) {
        return res.status(400).json({ message: "Email Not entered, please enter a valid email" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];

        // Query to Fetch tickets for this user
        db.query(
            `SELECT 
                t.quantity, 
                t.purchase_date, 
                e.title AS event_name, 
                e.date AS event_date, 
                e.price AS event_price 
             FROM tickets t 
             JOIN events e ON t.event_id = e.id 
             WHERE t.user_id = ?`,
            [user.id],
            (err, ticketResult) => {
                
                
                if (err) {
                    console.error("(Debug:SQL query)Error fetching tickets:", err);
                    return res.status(500).json({ message: "Error retrieving tickets" });
                }

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


//Debug: Start Server after 
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
