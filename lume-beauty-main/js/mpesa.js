async function showSuccessStep(total, identifier, method) {
  const txCode = 'QF' + Date.now().toString().slice(-8).toUpperCase();

  // Save order to DB
  if (currentUser?.id) {
    const paymentMeta = {
      mpesa_phone:  method === 'mpesa' ? identifier : null,
      card_last4:   method === 'card'  ? identifier : null,
      paypal_email: method === 'paypal'? identifier : null,
      provider_ref: txCode
    };
    const order = await createOrder(currentUser.id, cart, method, paymentMeta);
    if (order) await markOrderPaid(order.id, txCode);
    if (currentUser?.id) await clearCart(currentUser.id);
  }

  // rest of your existing code stays the same...