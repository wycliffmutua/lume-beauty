async function showSuccessStep(total, identifier, method) {
  const txCode = 'QF' + Date.now().toString().slice(-8).toUpperCase();

  // Save order to DB
  if (currentUser?.id) {
    const paymentMeta = {
      mpesa_phone:  method === 'mpesa'  ? identifier : null,
      card_last4:   method === 'card'   ? identifier : null,
      paypal_email: method === 'paypal' ? identifier : null,
      provider_ref: txCode
    };
    const order = await createOrder(currentUser.id, cart, method, paymentMeta);
    if (order) await markOrderPaid(order.id, txCode);
    await clearCart(currentUser.id);
  }

  const methodLabels = {
    mpesa:  'M-Pesa',
    card:   'Card',
    paypal: 'PayPal',
    bank:   'Bank Transfer'
  };

  document.getElementById('modal-box').innerHTML = `
    <div class="modal-success-icon">✅</div>
    <div class="modal-title" style="color:#2d7a50">Payment Successful!</div>
    <div class="modal-sub">
      <strong>KSh ${total.toLocaleString()}</strong> paid via ${methodLabels[method]}.<br/>
      Thank you, <strong>${currentUser.name}</strong>! Your order is confirmed. 🌸
    </div>
    <div class="modal-txn-code">Transaction Code: ${txCode}</div>
    <div style="font-size:0.78rem;color:#c8b5a0;margin-bottom:20px">
      Order details emailed to ${currentUser.email}.
    </div>
    <button class="modal-done-btn" onclick="finishOrder()">Continue Shopping →</button>
  `;

  cart = [];
  updateCartUI();
}