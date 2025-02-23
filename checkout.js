//This is the Checkout process backend code to insert purchased tickets into tickets table. 

document.addEventListener("DOMContentLoaded", function () {
    //PArsing URL parameters to retrieve the event's details
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");
    const eventName = urlParams.get("eventName");
    const ticketPrice = parseFloat(urlParams.get("eventPrice"));

    //Get user name by retireving data from local storage
    const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
    //Error handling, if user not logged in
    if (!userSession) {
        alert("You must be logged in to buy tickets.");
        window.location.href = "index.html";    //Redirect to home page
        return;
    }
    //Display event anme and ticket price 
    document.getElementById("event-name").innerText = eventName;
    document.getElementById("ticket-price").innerText = `$${ticketPrice.toFixed(2)}`;

    //Get ticket quantity and total cost
    const ticketQuantityInput = document.getElementById("ticket-quantity");
    const totalCostDisplay = document.getElementById("total-cost");
    //function calculating total cost (cost*quantity)
    function updateTotalCost() {
        let quantity = parseInt(ticketQuantityInput.value); //Convert input to integer
        //Validate ticket quantity
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
            ticketQuantityInput.value = 1;
        }
        //Calculating the total cost with two decimal places
        totalCostDisplay.innerText = `Total Cost: $${(ticketPrice * quantity).toFixed(2)}`;
    }

    //Update total cost 
    ticketQuantityInput.addEventListener("input", updateTotalCost);
    updateTotalCost();

    //Event listener for checkout button press
    document.getElementById("checkout-button").addEventListener("click", async () => {
        const ticketQuantity = parseInt(ticketQuantityInput.value) || 1;
        //Send purchase information using API
        try {
            const response = await fetch("http://localhost:5001/api/tickets/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userSession.id, //USer ID from session data
                    eventId: eventId,   //Event ID from URL 
                    quantity: ticketQuantity, //Number of tickets
                }),
            });

            //Error handling is no response from server.js
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${errorText}`);
            }
            //Parse the JSON resposnde from the server
            const data = await response.json();
            console.log("Checkout Response:", data); //debugging line
            //Check if the purchase was successful
            if (data.message.includes("success")) {
                alert("Ticket purchase successful!");
                window.location.href = "account.html";
            } else {
                alert("Ticket purchase failed. Please try again.");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Error purchasing tickets. Please check console for details.");
        }
    });
});
