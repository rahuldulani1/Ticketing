const express = require("express");
const router = express.Router();
const db = require("../config"); // Database connection route

router.get("/", (req, res) => {
    const { search } = req.query; // Capture search query from frontend

    let query = "SELECT * FROM events";
    let params = [];

    if (search) {
        query += " WHERE title LIKE ?";
        params.push(`%${search}%`);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});


console.log("Events route has been loaded");
module.exports = router;

