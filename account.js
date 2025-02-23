const API_URL = "http://localhost:5001/api";

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 My Account Page Loaded!");

    // ⏳ Delay execution slightly to ensure localStorage is available
    setTimeout(() => {
        let userSession = localStorage.getItem("userLoggedIn");

        console.log("📧 Checking stored session:", userSession);

        if (!userSession) {
            console.warn("⚠️ No user session found! Debugging now...");
            alert("⚠️ You must log in first.");
            
            // Instead of redirecting, print detailed logs
            console.log("❌ User session is missing! Here's what we have:");
            console.log("🔍 localStorage content:", localStorage.getItem("userLoggedIn"));
        
            setTimeout(() => {
                console.log("🚀 Attempting to reload the page instead of redirecting...");
                window.location.reload(); // Try reloading instead of redirecting
            }, 3000);
        
            return;
        }
        

        userSession = JSON.parse(userSession);
        console.log("✅ Successfully retrieved session:", userSession);

        // ✅ Update UI with username
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.innerText = `Welcome, ${userSession.name}!`;
        } else {
            console.error("❌ Element #user-name not found.");
        }

        // ✅ Fetch user details
        fetch(`${API_URL}/users/my-account`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userSession.email })
        })
        .then(response => {
            console.log("📡 Server response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("📩 Account data received:", data);

            if (data.user) {
                document.getElementById("user-name").innerText = `Welcome, ${data.user.name}!`;
                displayTickets(data.tickets);
            } else {
                console.warn("⚠️ No user data received.");
                alert("⚠️ Error loading account details.");
            }
        })
        .catch(error => {
            console.error("❌ Error fetching account details:", error);
            alert("⚠️ Error fetching account details.");
        });
    }, 500); // ⏳ Adding delay to ensure localStorage is accessible
});

// ✅ Function to Display User Tickets
function displayTickets(tickets) {
    const ticketsContainer = document.getElementById("tickets-container");
    if (!ticketsContainer) {
        console.error("❌ tickets-container element not found.");
        return;
    }

    ticketsContainer.innerHTML = "";
    if (tickets.length === 0) {
        ticketsContainer.innerHTML = "<p>No tickets purchased yet.</p>";
        return;
    }

    tickets.forEach(ticket => {
        let ticketDiv = document.createElement("div");
        ticketDiv.innerHTML = `
            <h3>${ticket.event_name}</h3>
            <p>Date: ${ticket.event_date}</p>
            <p>Price: $${ticket.price}</p>
        `;
        ticketsContainer.appendChild(ticketDiv);
    });
}
