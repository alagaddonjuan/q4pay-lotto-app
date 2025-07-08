function payWithSquad() {
    const userID = document.getElementById("userID").value; // Get the User ID
    const email = document.getElementById("email").value;
    const amount = document.getElementById("amount").value * 100; // Convert to kobo

    if (!userID || !email || !amount) {
        alert("Please fill out all fields.");
        return;
    }

    const squadInstance = new squad({
        onClose: () => {
            console.log("Widget closed");
        },
        onLoad: () => {
            console.log("Widget loaded successfully");
        },
        onSuccess: (response) => {
            console.log("Payment successful on client!", response);
            // Call our server to verify the transaction
            verifyPaymentOnServer(response.transaction_ref);
        },
        key: "sandbox_pk_8a64a774cd319f26bc005f3786bd8da25c6be80edd01", // Make sure this is still your key
        email: email,
        amount: amount,
        currency_code: "NGN",
    });

    squadInstance.setup();
    squadInstance.open();
}

async function verifyPaymentOnServer(transaction_ref) {
    try {
        const res = await fetch('https://q4pay-lotto-app.onrender.com/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transaction_ref: transaction_ref }),
        });

        const data = await res.json();

        if (res.ok) {
            // Server verified the payment successfully
            alert("Server verification successful: " + data.message);
            // You can now show a success page or give value to the user
        } else {
            // Server said the verification failed
            throw new Error(data.message);
        }
    } catch (error) {
        console.error("Verification failed:", error);
        alert("Payment verification failed. Please contact support. " + error.message);
    }
}