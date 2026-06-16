// ═══════════════════════════════════════════
//  LUMÉ Beauty — db.js
//  All Supabase database calls in one place.
//  Products, Cart, Orders, Payments
// ═══════════════════════════════════════════


// ── PRODUCTS ──────────────────────────────────────────

// Fetch all active products from DB
// This replaces the hardcoded PRODUCTS array in main.js
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (error) {
    console.error('fetchProducts error:', error.message);
    return [];
  }
  return data;
}


// ── CART ──────────────────────────────────────────────

// Load the user's saved cart from DB
// Returns array in same format as your local cart []
async function loadCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('loadCart error:', error.message);
    return [];
  }

  // Reshape to match your existing cart item format
  return data.map(item => ({
    ...item.products,
    qty: item.qty
  }));
}

// Add item or update its qty in DB
// Called every time addToCart() or addOne() runs
async function upsertCartItem(userId, productId, qty) {
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, qty: qty },
      { onConflict: 'user_id,product_id' }
    );

  if (error) {
    console.error('upsertCartItem error:', error.message);
  }
}

// Remove a single product from the cart in DB
// Called when qty hits 0 in removeOne()
async function removeCartItem(userId, productId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('removeCartItem error:', error.message);
  }
}

// Wipe the entire cart after order is placed
// Called inside finishOrder() in mpesa.js
async function clearCart(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('clearCart error:', error.message);
  }
}


// ── ORDERS ────────────────────────────────────────────

// Create a full order: order row + order items + payment row
// Returns the created order object, or null if something failed
async function createOrder(userId, cartItems, paymentMethod, paymentMeta = {}) {

  // Calculate totals (same logic as cart.js)
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 5000 ? 0 : 350;
  const total    = subtotal + shipping;

  // 1 ── Insert the order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id:  userId,
      subtotal: subtotal,
      shipping: shipping,
      total:    total,
      status:   'pending'
    })
    .select()
    .single();

  if (orderErr) {
    console.error('createOrder error:', orderErr.message);
    return null;
  }

  // 2 ── Insert order items (snapshot of what was bought)
  const orderItems = cartItems.map(i => ({
    order_id:      order.id,
    product_id:    i.id,
    product_name:  i.name,
    product_brand: i.brand,
    unit_price:    i.price,
    qty:           i.qty,
    line_total:    i.price * i.qty
  }));

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsErr) {
    console.error('createOrderItems error:', itemsErr.message);
    return null;
  }

  // 3 ── Insert payment record
  const { error: payErr } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      method:   paymentMethod,  // 'mpesa' | 'card' | 'paypal' | 'bank'
      amount:   total,
      status:   'pending',
      ...paymentMeta            // e.g. { mpesa_phone: '0712345678' }
    });

  if (payErr) {
    console.error('createPayment error:', payErr.message);
    return null;
  }

  return order;
}

// Mark order and payment as paid
// Call this after M-Pesa confirms payment (Stage 6)
async function markOrderPaid(orderId, providerRef) {
  const { error: orderErr } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

  if (orderErr) {
    console.error('markOrderPaid (order) error:', orderErr.message);
  }

  const { error: payErr } = await supabase
    .from('payments')
    .update({
      status:       'success',
      provider_ref: providerRef,
      paid_at:      new Date().toISOString()
    })
    .eq('order_id', orderId);

  if (payErr) {
    console.error('markOrderPaid (payment) error:', payErr.message);
  }
}

// Get all past orders for a user (for an order history page later)
async function fetchUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchUserOrders error:', error.message);
    return [];
  }
  return data;
}