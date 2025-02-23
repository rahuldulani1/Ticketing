const API_URL = "http://localhost:5001/api"; //API URL path for HTTP requests to backend

//Wait till DOM is loaded before executing the program
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded!");
    //Get references for buttons and display areas
    const loginButton = document.getElementById("login-button");
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-events");
    const homeButton = document.getElementById("home-button");
    const userDisplay = document.getElementById("user-display");
    const accountButton = document.getElementById("account-button");
    const registerButton = document.getElementById("register-button");
    
    //Event listeners for register, login, myaccount and home buttons. 
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
            //redirect to home page
            window.location.href = "index.html";
        });
    }

    if (accountButton) {
        accountButton.addEventListener("click", () => {
            const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
            if (userSession && userSession.email) {
                //naviagte to account page
                console.log("Redirecting to account page");
                window.location.href = "account.html";
            } else {
                //error handling: need to sign in before going to account page
                alert("You must be signed in to access your account!");
            }
        });
    }
    //Event listener for the search button 
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", (event) => {
            event.preventDefault(); //Debug, preventing default form submission
            const query = searchInput.value.trim();
            
            if (query !== "") {
                console.log(`Search button clicked! Query: "${query}"`);
                localStorage.setItem("searchQuery", query);
                console.log("Redirecting to Home Page");
                //redirect to home page, index.html
                window.location.href = `events.html?search=${encodeURIComponent(query)}`;
            } else {
                //If nothing is entered throw an error message
                alert("Please enter a search term!");
            }
        });
        //console log for debugging 
        console.log("searchButton event listener attached.");
    }
    //Only allow search on search button press
    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchButton.click();
            }
        });
    }
    //Search on events page, restore events page with new search results
    if (window.location.pathname.includes("events.html")) {
        console.log("User is on events.html");
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get("search");

        if (searchQuery) {
            console.log(`Restoring search: "${searchQuery}"`);
            if (searchInput) {
                searchInput.value = searchQuery; //reset
            }
            //fetch events based on search query
            fetchSearchedEvents(searchQuery);
        } else {
            //if no matching results found
            console.log("No search query found. Fetching all events...");
            fetchEvents();
        }
    }
    //display current users information on page
    displayUser();
});

// User Registration Function
function registerUser() {
    //Retrieve user values from the registration form and trim them
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    //Check to ensure user has enetered all fields
    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }
    //POST request to send the user information 
    fetch("http://localhost:5001/api/users/register", {  // API URL Path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    //parse the resposne
    .then(response => response.json())
    .then(data => {
        console.log("Registration response:", data);

        //Response for Registration succes/fail based on API
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
    //Retrieve values from user inputs
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    //Sending a POST request to the login API with user inputs
    fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Login response:", data);
        //Login successful check
        if (data.message === "Login successful!" && data.user) {
            alert("Login successful!");
            localStorage.setItem("userLoggedIn", JSON.stringify(data.user));  // Storing full user object
            console.log("User session stored:", localStorage.getItem("userLoggedIn"));
            //Update user display, display user name on page
            displayUser();
        } else {
            //error
            alert("Login failed: " + data.message);
        }
    })
    .catch(error => console.error("Login Error (Script.js API):", error));
}


// Fetch All Events
function fetchEvents(searchQuery = "") {
    let url = "http://localhost:5001/api/events";
    //Append the search query as a parameter of the URL
    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    //GET request to retrieve events 
    fetch(url)
        .then(response => response.json())
        .then(events => {
            console.log("Fetched Events:", events);
            displayEvents(events); //display results
        })
        .catch(error => console.error("Error fetching events(Script.js line-169):", error));
}


//Fetch Events Based on Search Query. Using GET request and then filtering locally 
function fetchSearchedEvents(query) {
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(events => {
            console.log("Filtering events with query:", query); //debuging log message
            //Filtering the events to match search query
            const filteredEvents = events.filter(event =>
                event.title.toLowerCase().includes(query.toLowerCase()) ||
                event.description.toLowerCase().includes(query.toLowerCase())
            );
            console.log("Filtered Events:", filteredEvents);
            displayEvents(filteredEvents); //dsiaplay results 
        })
        .catch(error => console.error("Script.js-Error fetching events:", error));
}

//Rendering of Events on Events Page
function displayEvents(events) {
    const eventsList = document.getElementById("events-list");
    if (!eventsList) return;

    eventsList.innerHTML = "";
    //if no events found
    if (events.length === 0) {
        eventsList.innerHTML = "<p>No events found.</p>";
        return;
    }
    //Create a new DOM element for each event, then appent to events
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
        //append the event to events list
        eventsList.appendChild(div);
    });
}

//Display User Name on Home Page
function displayUser() {
    //Retrieve user session from local storage
    const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
    const userDisplay = document.getElementById("user-display");
    //If user is logged in display the user's name
    if (userSession && userSession.name && userDisplay) {
        userDisplay.innerHTML = `👤 ${userSession.name}`;
    //If no user is logged in, then display Sign In
    } else if (userDisplay) {
        userDisplay.innerHTML = `<a href="index.html">Sign In</a>`;
    }
}

//Buy Ticket Function (Redirects to Checkout)
function buyTicket(eventId, eventName, eventPrice) {
    console.log(`Redirecting to checkout for event: ${eventName} at $${eventPrice}`);
    //redirect to checkout page
    window.location.href = `checkout.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}&eventPrice=${eventPrice}`;
}

//Logout Function
function logout() {
    localStorage.removeItem("userLoggedIn");
    alert("Logged out successfully!");
    //redirect to home page
    window.location.href = "index.html";
}
