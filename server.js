const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();

// This object will act as our temporary, in-memory database
const userDatabase = {};

// --- Middleware Setup ---
// Middleware should be set up before routes.
app.use(cors());
app.use(express.json());

// --- Configuration ---
const SQUAD_SECRET_KEY = 'sandbox_sk_8a64a774cd319f26bc005c3281cb88cc4975f078bd74';

// --- Route Definitions ---

// Route 1: Verify a payment from the initial checkout form
app.post('/verify-payment', async (req, res) => {
    const { transaction_ref } = req.body;

    if (!transaction_ref) {
        return res.status(400).json({ message: "Transaction reference is required" });
    }

    const url = `https://sandbox-api-d.squadco.com/transaction/verify/${transaction_ref}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${SQUAD_SECRET_KEY}` }
        });
        const data = await response.json();

        if (data.status === 200 && data.data.transaction_status === "success") {
            console.log("Payment verified successfully!");
            res.status(200).json({ message: "Payment verified successfully" });
        } else {
            res.status(400).json({ message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "An error occurred during verification" });
    }
});

// Route 2: Create a dedicated virtual account
app.post('/create-virtual-account', async (req, res) => {
    const { 
        firstName, lastName, phone, email, userID, dob, 
        gender, address, beneficiaryAccount 
    } = req.body;

    if (!firstName || !lastName || !phone || !userID || !dob || !gender || !address || !beneficiaryAccount) {
        return res.status(400).json({ message: "All required fields were not provided." });
    }

    const url = 'https://sandbox-api-d.squadco.com/virtual-account';
    const TEST_BVN = "22222222222";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SQUAD_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "first_name": firstName,
                "last_name": lastName,
                "mobile_num": phone,
                "email": email,
                "customer_identifier": userID,
                "bvn": TEST_BVN,
                "dob": dob,
                "gender": gender,
                "address": address,
                "beneficiary_account": beneficiaryAccount
            })
        });

        const data = await response.json();

        if (data.status === 200) {
            console.log("Virtual Account Created:", data.data);
            // Save the new account data to our database simulation
            userDatabase[userID] = data.data; 
            res.status(200).json(data.data);
        } else {
            console.error("Failed to create virtual account:", data);
            res.status(400).json({ message: data.message });
        }
    } catch (error) {
        console.error("Error creating virtual account:", error);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Route 3: Get a user's saved virtual account details
app.get('/get-user-account/:userID', (req, res) => {
    const userID = req.params.userID;
    const userData = userDatabase[userID];

    if (userData) {
        res.status(200).json({
            account_name: userData.account_name || `${userData.first_name} ${userData.last_name}`,
            account_number: userData.virtual_account_number,
            bank_name: "Wema Bank" 
        });
    } else {
        res.status(404).json({ message: "User account not found." });
    }
});

// This is needed to verify the webhook signature
const crypto = require('crypto');

app.post('/squad-webhook', (req, res) => {
    // Get the signature from the request headers
    const signature = req.headers['x-squad-signature'];
    
    // Create the hash using your main SQUAD_SECRET_KEY directly
    const hash = crypto.createHmac('sha512', SQUAD_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    // Compare the signature from Squad with your calculated hash
    if (signature === hash) {
        console.log('Webhook received and verified successfully!');
        
        const transaction = req.body;
        console.log('Transaction Body:', transaction);

        // TODO: Add your business logic here
        // 1. Check if transaction.Transaction_Status is "SUCCESSFUL"
        if (transaction.Status === "successful" || transaction.Transaction_Status === "SUCCESSFUL") {

            // 3. Get the user ID and the amount paid
            const userID = transaction.customer_identifier;
            const amountPaid = parseFloat(transaction.principal_amount);

            // 4. Credit the user's wallet in your database
            console.log(`Crediting user ${userID} with NGN ${amountPaid}`);
            
            // In a real application, you would run your database command here.
            // For example:
            // database.users[userID].wallet += amountPaid; 
        }
        // 2. Find the user via transaction.customer_identifier
        // 3. Credit the user's wallet with transaction.Amount

        // Send a 200 OK response to Squad to acknowledge receipt
        res.sendStatus(200);
    } else {
        // Signature is invalid
        console.error('Webhook verification failed.');
        res.sendStatus(401); // Unauthorized
    }
});

// --- Start the Server ---
// This MUST be the last thing in the file.
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});