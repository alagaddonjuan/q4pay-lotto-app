// This function runs automatically when the page loads
window.onload = function() {
    // In a real app, you would get the logged-in user's ID.
    // For this test, we'll hardcode it to match the one we created.
    const loggedInUserID = 'USER-12345'; 

    fetchAccountDetails(loggedInUserID);
};

async function fetchAccountDetails(userID) {
    try {
        // Call the new backend endpoint we created
        const response = await fetch(`https://q4pay-lotto-app.onrender.com/get-user-account/${userID}`);
        
        if (!response.ok) {
            // Handle cases where the user account wasn't found
            throw new Error('Could not fetch account details.');
        }

        const data = await response.json();

        // Update the HTML with the data received from the server
        document.getElementById('bank-name').textContent = data.bank_name;
        document.getElementById('account-name').textContent = data.account_name;
        document.getElementById('account-number').textContent = data.account_number;

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.payment-container').innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
    }
}