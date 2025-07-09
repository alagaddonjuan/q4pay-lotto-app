// --- Element References ---
const amountInput = document.getElementById('amount-input');
const customFeeInput = document.getElementById('custom-fee-input');
const settlementOutput = document.getElementById('settlement-output');
const squadFeeOutput = document.getElementById('squad-fee-output');
const customFeeOutput = document.getElementById('custom-fee-output');
const tabButtons = document.querySelectorAll('.tab-button');

// --- State and Constants ---
let activeTab = 'paymentLink';
const SQUAD_FEES = {
    paymentLink: { percentage: 1.20, cap: 1500 },
    virtualAccount: { percentage: 0.25, cap: 1000 }
};

// --- Functions ---
function calculateCharges() {
    const amount = parseFloat(amountInput.value) || 0;
    const customFeePercent = parseFloat(customFeeInput.value) || 0;

    if (amount <= 0) {
        resetOutputs();
        return;
    }

    // Calculate Squad Fee based on the active tab
    const feeConfig = SQUAD_FEES[activeTab];
    let squadFee = amount * (feeConfig.percentage / 100);
    // Apply the fee cap
    if (squadFee > feeConfig.cap) {
        squadFee = feeConfig.cap;
    }

    // Calculate your custom fee
    const customFee = amount * (customFeePercent / 100);

    // Calculate final settlement
    const totalFees = squadFee + customFee;
    const settlement = amount - totalFees;

    // Update the display
    squadFeeOutput.textContent = squadFee.toFixed(2);
    customFeeOutput.textContent = customFee.toFixed(2);
    settlementOutput.textContent = settlement.toFixed(2);
}

function switchTab(tabName) {
    activeTab = tabName;
    // Update active class on buttons
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.textContent.toLowerCase().includes(tabName.toLowerCase()));
    });
    // Recalculate fees when tab switches
    calculateCharges();
}

function resetOutputs() {
    settlementOutput.textContent = '0.00';
    squadFeeOutput.textContent = '0.00';
    customFeeOutput.textContent = '0.00';
}

// --- Event Listeners ---
amountInput.addEventListener('input', calculateCharges);
customFeeInput.addEventListener('input', calculateCharges);

// Initialize the view for the default active tab
window.onload = () => switchTab('paymentLink');