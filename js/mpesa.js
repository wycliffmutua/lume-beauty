// ═══════════════════════════════════════════
//  LUMÉ Beauty — mpesa.js
//  Handles: M-Pesa payment modal
//  3 states:
//    1. Enter phone number
//    2. Processing (spinner — waiting for PIN)
//    3. Success (transaction code shown)
// ═══════════════════════════════════════════

// ── START MPESA ───────────────────────────────────────
// Called when user clicks "Pay with M-Pesa" in cart drawer
function startMpesa() {
  if (!cart || cart.length === 0) {
    showToast('Add some products to your cart first!');
    return;
  }

  const total = getCartTotal(); // from cart.js
  showPhoneStep(total);
}

// ── STEP 1: ENTER PHONE NUMBER ────────────────────────
function showPhoneStep(total) {
  const box = document.getElementById('modal-box');

  box.innerHTML = `
    <div class="modal-icon">📱</div>
    <div class="modal-title">M-Pesa Payment</div>
    <div class="modal-sub">
      Enter your Safaricom phone number.<br/>
      You'll get a prompt to enter your M-Pesa PIN.
    </div>
    <input
      class="modal-phone-input"
      id="mpesa-phone"
      type="tel"
      placeholder="e.g. 0712 345 678"
      maxlength="13"
    />
    <div class="modal-amount">
      Amount: <strong>KSh ${total.toLocaleString()}</strong>
    </div>
    <button class="modal-pay-btn" onclick="submitPayment(${total})">
      Send M-Pesa Prompt →
    </button>
    <button class="modal-cancel-btn" onclick="closeModal()">Cancel</button>
  `;

  openModal();

  // Let user press Enter to submit
  setTimeout(() => {
    document.getElementById('mpesa-phone')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitPayment(total);
    });
  }, 100);
}

// ── STEP 2: SUBMIT + PROCESSING ───────────────────────
// Called when user clicks "Send M-Pesa Prompt"
async function submitPayment(total) {
  const rawPhone = document.getElementById('mpesa-phone').value.replace(/\s/g, '');

  // Basic validation — must have at least 9 digits
  if (!rawPhone || rawPhone.replace(/\D/g, '').length < 9) {
    showToast('Please enter a valid M-Pesa phone number');
    return;
  }

  // Show the processing / spinner state
  showProcessingStep(rawPhone);

  // ── PRODUCTION: Send real STK push via your backend ──
  // Uncomment this when your backend is deployed:
  //
  // try {
  //   const res = await fetch('https://your-backend.railway.app/mpesa/stkpush', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ phone: rawPhone, amount: total })
  //   });
  //   const data = await res.json();
  //   // Then poll /mpesa/status/:checkoutId every 2 seconds
  //   // until status === 'paid', then call showSuccessStep()
  // } catch(e) {
  //   showToast('Payment failed. Try again.');
  // }

  // ── DEMO MODE: simulate 4 second wait then success ──
  setTimeout(() => {
    showSuccessStep(total, rawPhone);
  }, 4000);
}

// ── STEP 2 UI: SPINNER ───────────────────────────────
function showProcessingStep(phone) {
  document.getElementById('modal-box').innerHTML = `
    <div class="modal-spinner"></div>
    <div class="modal-title">Waiting for confirmation…</div>
    <div class="modal-sub">
      A prompt has been sent to <strong>${phone}</strong>.<br/><br/>
      📱 Check your phone and enter your <strong>M-Pesa PIN</strong> to complete the payment.
    </div>
    <p style="font-size:0.76rem;color:#c8b5a0;margin-top:16px">Do not close this window.</p>
  `;
}

// ── STEP 3: SUCCESS ───────────────────────────────────
function showSuccessStep(total, phone) {
  // Generate a fake M-Pesa transaction code
  // In production this comes back from Safaricom's callback
  const txCode = 'QF' + Date.now().toString().slice(-8).toUpperCase();

  document.getElementById('modal-box').innerHTML = `
    <div class="modal-success-icon">✅</div>
    <div class="modal-title" style="color:#2d7a50">Payment Successful!</div>
    <div class="modal-sub">
      <strong>KSh ${total.toLocaleString()}</strong> paid via M-Pesa.<br/>
      Thank you, <strong>${currentUser.name}</strong>! Your order is confirmed. 🌸
    </div>
    <div class="modal-txn-code">
      M-Pesa Code: ${txCode}
    </div>
    <div style="font-size:0.78rem;color:#c8b5a0;margin-bottom:20px">
      Confirmation SMS sent to ${phone}.<br/>
      Order details emailed to ${currentUser.email}.
    </div>
    <button class="modal-done-btn" onclick="finishOrder()">Continue Shopping →</button>
  `;

  // Clear the cart — order is done
  cart = [];
  updateCartUI();
}

// ── FINISH ORDER ──────────────────────────────────────
// After user clicks "Continue Shopping" on success screen
function finishOrder() {
  closeModal();

  // Close cart drawer too
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('shade').classList.remove('on');

  // Re-render products (buttons reset to "Add to Cart")
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
