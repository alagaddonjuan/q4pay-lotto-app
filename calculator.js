// --- Element References ---
const amountInput = document.getElementById('amount-input');
const settlementOutput = document.getElementById('settlement-output');
const q4payFeeOutput = document.getElementById('q4pay-fee-output');
const tabButtons = document.querySelectorAll('.tab-button');
const calculatorSection = document.getElementById('calculator-section');
const tabContents = document.querySelectorAll('.tab-content');

// --- Configuration Constants ---
const Q4PAY_FEES = {
    paymentLink: { percentage: 1.45, cap: 1500 }, // Updated
    virtualAccount: { percentage: 0.45, cap: 1000 }, // Updated
    transfer: { text: "₦10 - ₦50" }
};
let activeTab = 'paymentLink';

// --- Functions ---
function calculateCharges() {
    if (activeTab === 'transfer') return;

    const amount = parseFloat(amountInput.value) || 0;
    if (amount <= 0) {
        resetOutputs();
        return;
    }

    const feeConfig = Q4PAY_FEES[activeTab];
    let q4payFee = amount * (feeConfig.percentage / 100);
    if (q4payFee > feeConfig.cap) {
        q4payFee = feeConfig.cap;
    }

    // Settlement is now just the amount minus the Q4Pay fee
    const settlement = amount - q4payFee;

    q4payFeeOutput.textContent = q4payFee.toFixed(2);
    settlementOutput.textContent = settlement.toFixed(2);
}

function switchTab(tabName) {
    activeTab = tabName;
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('onclick').includes(tabName));
    });
    tabContents.forEach(content => {
        content.style.display = content.id.includes(tabName) ? 'block' : 'none';
    });
    
    if (tabName === 'transfer') {
        calculatorSection.style.display = 'none';
    } else {
        calculatorSection.style.display = 'block';
        resetOutputs();
        calculateCharges();
    }
}

function resetOutputs() {
    settlementOutput.textContent = '0.00';
    q4payFeeOutput.textContent = '0.00';
}

// --- Initial Setup ---
window.onload = () => switchTab('paymentLink');
amountInput.addEventListener('input', calculateCharges);