const API_URL = "http://localhost:5001/api"; //API path

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded!");

    const loginButton = document.getElementById("login-button");
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-events");
    const homeButton = document.getElementById("home-button");
    const userDisplay = document.getElementById("user-display");
    const accountButton = document.getElementById("account-button");
    const registerButton = document.getElementById("register-button");
    
    //Event listeners
    if (registerButton) {
        registerButton.addEventListener("click", registerUser);
        console.log("registerUser() event listener attached.");
    } else {
        console.error("Register button Error");
    }

    if (loginButton) {
        loginButton.addEventListener("click", loginUser);
        console.log("loginUser() event listener attached.");
    }

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            console.log("Home button clicked. Redirecting to home page...");
            window.location.href = "index.html";
        });
    }

    if (accountButton) {
        accountButton.addEventListener("click", () => {
            const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
            if (userSession && userSession.email) {
                console.log("Redirecting to account page");
                window.location.href = "account.html";
            } else {
                alert("You must be signed in to access your account!");
            }
        });
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            
            if (query !== "") {
                console.log(`Search button clicked! Query: "${query}"`);
                localStorage.setItem("searchQuery", query);
                console.log("Redirecting to Home Page");
                window.location.href = `events.html?search=${encodeURIComponent(query)}`;
            } else {
                alert("Please enter a search term!");
            }
        });
        console.log("searchButton event listener attached.");
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchButton.click();
            }
        });
    }

    if (window.location.pathname.includes("events.html")) {
        console.log("User is on events.html");
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get("search");

        if (searchQuery) {
            console.log(`Restoring search: "${searchQuery}"`);
            if (searchInput) {
                searchInput.value = searchQuery;
            }
            fetchSearchedEvents(searchQuery);
        } else {
            console.log("No search query found. Fetching all events...");
            fetchEvents();
        }
    }

    displayUser();
});

// User Registration Function
function registerUser() {
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("http://localhost:5001/api/users/register", {  // API Path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Registration response:", data);

        //Response for Registration succes/fail
        if (data.message.includes("Successfully")) {   
            alert("Registration successful! You can now log in.");
        } else {
            alert("Registration failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Registration Error:", error);
        alert("Registration failed due to a network issue in registration POST API");
    });
}





//User Login Function
function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔍 Login response:", data);
        
        if (data.message === "Login successful!" && data.user) {
            alert("Login successful!");
            localStorage.setItem("userLoggedIn", JSON.stringify(data.user));  // Storing full user object
            console.log("User session stored:", localStorage.getItem("userLoggedIn"));
            displayUser();
        } else {
            alert("Login failed: " + data.message);
        }
    })
    .catch(error => console.error("Login Error (Script.js API):", error));
}


// Fetch All Events
function fetchEvents(searchQuery = "") {
    let url = "http://localhost:5001/api/events";
    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(events => {
            console.log("🔍 Fetched Events:", events);
            displayEvents(events);
        })
        .catch(error => console.error("Error fetching events(Script.js line-169):", error));
}


//Fetch Events Based on Search Query
function fetchSearchedEvents(query) {
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(events => {
            console.log("Filtering events with query:", query);
            const filteredEvents = events.filter(event =>
                event.title.toLowerCase().includes(query.toLowerCase()) ||
                event.description.toLowerCase().includes(query.toLowerCase())
            );
            console.log("Filtered Events:", filteredEvents);
            displayEvents(filteredEvents);
        })
        .catch(error => console.error("Script.js-Error fetching events:", error));
}

//Display Events on Events Page
function displayEvents(events) {
    const eventsList = document.getElementById("events-list");
    if (!eventsList) return;

    eventsList.innerHTML = "";
    if (events.length === 0) {
        eventsList.innerHTML = "<p>No events found.</p>";
        return;
    }

    events.forEach(event => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.date} - ${event.location}</p>
            <p>${event.description}</p>
            <p>Price: $${event.price}</p>
            <button onclick="buyTicket(${event.id}, '${event.title}', ${event.price})">Buy Ticket</button>
        `;
        eventsList.appendChild(div);
    });
}

//Display User Name on Home Page
function displayUser() {
    const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
    const userDisplay = document.getElementById("user-display");
    if (userSession && userSession.name && userDisplay) {
        userDisplay.innerHTML = `👤 ${userSession.name}`;
    } else if (userDisplay) {
        userDisplay.innerHTML = `<a href="index.html">Sign In</a>`;
    }
}

//Buy Ticket Function (Redirects to Checkout)
function buyTicket(eventId, eventName, eventPrice) {
    console.log(`Redirecting to checkout for event: ${eventName} at $${eventPrice}`);

    window.location.href = `checkout.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}&eventPrice=${eventPrice}`;
}

//Logout Function
function logout() {
    localStorage.removeItem("userLoggedIn");
    alert("Logged out successfully!");
    window.location.href = "index.html";
}
