// Get the elements from the HTML
const amountInput = document.getElementById('amount-input');
const settlementOutput = document.getElementById('settlement-output');
const feeOutput = document.getElementById('fee-output');

// Define your fee percentage here
const FEE_PERCENTAGE = 1.20;

// This function will run every time the user types in the input box
function calculateCharges() {
    const amount = parseFloat(amountInput.value);

    // Check if the input is a valid number and greater than zero
    if (isNaN(amount) || amount <= 0) {
        settlementOutput.textContent = '0.00';
        feeOutput.textContent = '0.00';
        return;
    }

    // Calculate the fee
    const fee = amount * (FEE_PERCENTAGE / 100);

    // Calculate the settlement amount
    const settlement = amount - fee;

    // Display the results, formatted to 2 decimal places
    settlementOutput.textContent = settlement.toFixed(2);
    feeOutput.textContent = fee.toFixed(2);
}

// Add an event listener to the input field
amountInput.addEventListener('input', calculateCharges);