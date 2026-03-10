// ═══════════════════════════════════════════
//  LUMÉ Beauty — mpesa.js
//  Handles: Payment modal with multiple methods
//  Methods: M-Pesa, Card, PayPal, Bank Transfer
// ═══════════════════════════════════════════

// ── START PAYMENT ─────────────────────────────────────
// Called when user clicks "Checkout" in cart drawer
function startMpesa() {
  if (!cart || cart.length === 0) {
    showToast('Add some products to your cart first!');
    return;
  }

  const total = getCartTotal();
  showPaymentSelect(total);
}

// ── STEP 1: SELECT PAYMENT METHOD ────────────────────
function showPaymentSelect(total) {
  const box = document.getElementById('modal-box');

  box.innerHTML = `
    <div class="modal-icon">🛍️</div>
    <div class="modal-title">Choose Payment Method</div>
    <div class="modal-sub">
      Total: <strong>KSh ${total.toLocaleString()}</strong>
    </div>

    <select class="modal-dropdown" id="payment-method" onchange="onPaymentChange()">
      <option value="">-- Select a payment method --</option>
      <option value="mpesa">📱 M-Pesa</option>
      <option value="card">💳 Card (Visa / Mastercard)</option>
      <option value="paypal">🅿️ PayPal</option>
      <option value="bank">🏦 Bank Transfer</option>
    </select>

    <div id="payment-form-area"></div>

    <button class="modal-cancel-btn" onclick="closeModal()">Cancel</button>
  `;

  openModal();
}

// ── ON DROPDOWN CHANGE ────────────────────────────────
function onPaymentChange() {
  const method = document.getElementById('payment-method').value;
  const area   = document.getElementById('payment-form-area');
  const total  = getCartTotal();

  area.innerHTML = '';

  if (method === 'mpesa')  area.innerHTML = mpesaForm(total);
  if (method === 'card')   area.innerHTML = cardForm(total);
  if (method === 'paypal') area.innerHTML = paypalForm(total);
  if (method === 'bank')   area.innerHTML = bankForm(total);
}

// ── M-PESA FORM ───────────────────────────────────────
function mpesaForm(total) {
  return `
    <div class="payment-section">
      <div class="modal-sub">Enter your Safaricom number to receive an M-Pesa PIN prompt.</div>
      <input
        class="modal-phone-input"
        id="mpesa-phone"
        type="tel"
        placeholder="e.g. 0712 345 678"
        maxlength="13"
      />
      <button class="modal-pay-btn" onclick="submitMpesa(${total})">
        📱 Send M-Pesa Prompt →
      </button>
    </div>
  `;
}

// ── CARD FORM ─────────────────────────────────────────
function cardForm(total) {
  return `
    <div class="payment-section">
      <div class="modal-sub">Enter your card details below.</div>
      <input class="modal-input" id="card-name"   type="text"   placeholder="Cardholder Name" />
      <input class="modal-input" id="card-number" type="text"   placeholder="Card Number (16 digits)" maxlength="19" oninput="formatCardNumber(this)" />
      <div style="display:flex; gap:10px;">
        <input class="modal-input" id="card-expiry" type="text" placeholder="MM/YY" maxlength="5" style="flex:1" oninput="formatExpiry(this)" />
        <input class="modal-input" id="card-cvv"    type="password" placeholder="CVV" maxlength="3" style="flex:1" />
      </div>
      <button class="modal-pay-btn" onclick="submitCard(${total})">
        💳 Pay KSh ${total.toLocaleString()} →
      </button>
    </div>
  `;
}

// ── PAYPAL FORM ───────────────────────────────────────
function paypalForm(total) {
  return `
    <div class="payment-section">
      <div class="modal-sub">Enter your PayPal email to complete payment.</div>
      <input class="modal-input" id="paypal-email" type="email" placeholder="your@paypal.com" />
      <button class="modal-pay-btn" onclick="submitPaypal(${total})">
        🅿️ Pay with PayPal →
      </button>
    </div>
  `;
}

// ── BANK TRANSFER FORM ────────────────────────────────
function bankForm(total) {
  return `
    <div class="payment-section">
      <div class="modal-sub">Transfer to the account below and upload your slip.</div>
      <div class="bank-details">
        <div class="bank-row"><span>Bank</span><strong>Equity Bank Kenya</strong></div>
        <div class="bank-row"><span>Account Name</span><strong>LUMÉ Beauty Ltd</strong></div>
        <div class="bank-row"><span>Account No.</span><strong>0123456789</strong></div>
        <div class="bank-row"><span>Branch</span><strong>Nairobi CBD</strong></div>
        <div class="bank-row"><span>Amount</span><strong>KSh ${total.toLocaleString()}</strong></div>
        <div class="bank-row"><span>Reference</span><strong>${currentUser.email}</strong></div>
      </div>
      <button class="modal-pay-btn" onclick="submitBank(${total})">
        🏦 I Have Transferred →
      </button>
    </div>
  `;
}

// ── SUBMIT: M-PESA ────────────────────────────────────
async function submitMpesa(total) {
  const rawPhone = document.getElementById('mpesa-phone').value.replace(/\s/g, '');
  if (!rawPhone || rawPhone.replace(/\D/g, '').length < 9) {
    showToast('Please enter a valid M-Pesa phone number');
    return;
  }
  showProcessingStep(rawPhone, 'mpesa');
  setTimeout(() => showSuccessStep(total, rawPhone, 'mpesa'), 4000);
}

// ── SUBMIT: CARD ──────────────────────────────────────
function submitCard(total) {
  const name   = document.getElementById('card-name').value.trim();
  const number = document.getElementById('card-number').value.replace(/\s/g, '');
  const expiry = document.getElementById('card-expiry').value.trim();
  const cvv    = document.getElementById('card-cvv').value.trim();

  if (!name || number.length < 16 || expiry.length < 5 || cvv.length < 3) {
    showToast('Please fill in all card details correctly.');
    return;
  }
  showProcessingStep(number.slice(-4), 'card');
  setTimeout(() => showSuccessStep(total, number.slice(-4), 'card'), 3000);
}

// ── SUBMIT: PAYPAL ────────────────────────────────────
function submitPaypal(total) {
  const email = document.getElementById('paypal-email').value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid PayPal email.');
    return;
  }
  showProcessingStep(email, 'paypal');
  setTimeout(() => showSuccessStep(total, email, 'paypal'), 3000);
}

// ── SUBMIT: BANK ──────────────────────────────────────
function submitBank(total) {
  showProcessingStep('', 'bank');
  setTimeout(() => showSuccessStep(total, '', 'bank'), 2000);
}

// ── PROCESSING SPINNER ────────────────────────────────
function showProcessingStep(identifier, method) {
  const messages = {
    mpesa:  `A prompt has been sent to <strong>${identifier}</strong>.<br/><br/>📱 Enter your <strong>M-Pesa PIN</strong> to complete payment.`,
    card:   `Processing your card ending in <strong>${identifier}</strong>.<br/><br/>🔒 Securely verifying your details...`,
    paypal: `Connecting to PayPal for <strong>${identifier}</strong>.<br/><br/>🅿️ Completing your payment...`,
    bank:   `Confirming your bank transfer.<br/><br/>🏦 This may take 1–2 business days to reflect.`
  };

  document.getElementById('modal-box').innerHTML = `
    <div class="modal-spinner"></div>
    <div class="modal-title">Processing Payment…</div>
    <div class="modal-sub">${messages[method]}</div>
    <p style="font-size:0.76rem;color:#c8b5a0;margin-top:16px">Do not close this window.</p>
  `;
}

// ── SUCCESS SCREEN ────────────────────────────────────
function showSuccessStep(total, identifier, method) {
  const txCode = 'QF' + Date.now().toString().slice(-8).toUpperCase();

  const methodLabels = {
    mpesa:  '📱 M-Pesa',
    card:   '💳 Card',
    paypal: '🅿️ PayPal',
    bank:   '🏦 Bank Transfer'
  };

  document.getElementById('modal-box').innerHTML = `
    <div class="modal-success-icon">✅</div>
    <div class="modal-title" style="color:#2d7a50">Payment Successful!</div>
    <div class="modal-sub">
      <strong>KSh ${total.toLocaleString()}</strong> paid via ${methodLabels[method]}.<br/>
      Thank you, <strong>${currentUser.name}</strong>! Your order is confirmed. 🌸
    </div>
    <div class="modal-txn-code">
      Transaction Code: ${txCode}
    </div>
    <div style="font-size:0.78rem;color:#c8b5a0;margin-bottom:20px">
      Order details emailed to ${currentUser.email}.
    </div>
    <button class="modal-done-btn" onclick="finishOrder()">Continue Shopping →</button>
  `;

  cart = [];
  updateCartUI();
}

// ── FINISH ORDER ──────────────────────────────────────
function finishOrder() {
  closeModal();
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('shade').classList.remove('on');
  renderProducts();
  showToast('🎉 Order placed! Thank you for shopping at LUMÉ.', 'green');
}

// ── OPEN / CLOSE MODAL ────────────────────────────────
function openModal() {
  document.getElementById('modal-overlay').classList.add('on');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('on');
}

// ── CARD NUMBER FORMATTER ─────────────────────────────
function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.match(/.{1,4}/g)?.join(' ') || val;
}

// ── EXPIRY FORMATTER ──────────────────────────────────
function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
  input.value = val;
}