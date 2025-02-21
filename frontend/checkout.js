document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");
    const eventName = urlParams.get("eventName");
    const ticketPrice = parseFloat(urlParams.get("eventPrice"));

    const userSession = JSON.parse(localStorage.getItem("userLoggedIn"));
    if (!userSession) {
        alert("⚠️ You must be logged in to buy tickets.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("event-name").innerText = eventName;
    document.getElementById("ticket-price").innerText = `$${ticketPrice.toFixed(2)}`;

    const ticketQuantityInput = document.getElementById("ticket-quantity");
    const totalCostDisplay = document.getElementById("total-cost");

    function updateTotalCost() {
        let quantity = parseInt(ticketQuantityInput.value);
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
            ticketQuantityInput.value = 1;
        }
        totalCostDisplay.innerText = `Total Cost: $${(ticketPrice * quantity).toFixed(2)}`;
    }

    ticketQuantityInput.addEventListener("input", updateTotalCost);
    updateTotalCost();

    document.getElementById("checkout-button").addEventListener("click", async () => {
        const ticketQuantity = parseInt(ticketQuantityInput.value) || 1;

        try {
            const response = await fetch("http://localhost:5001/api/tickets/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userSession.id,
                    eventId: eventId,
                    quantity: ticketQuantity,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${errorText}`);
            }

            const data = await response.json();
            console.log("Checkout Response:", data);

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
