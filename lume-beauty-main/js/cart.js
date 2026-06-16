async function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  // Save to DB
  const item = cart.find(i => i.id === productId);
  if (currentUser?.id) {
    await upsertCartItem(currentUser.id, productId, item.qty);
  }

  updateCartUI();
  renderProducts();
  showToast(`${product.name} added to cart! 🛍`);
}

async function removeOne(productId) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty--;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
    if (currentUser?.id) await removeCartItem(currentUser.id, productId);
  } else {
    if (currentUser?.id) await upsertCartItem(currentUser.id, productId, item.qty);
  }

  updateCartUI();
  renderProducts();
}

async function addOne(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty++;
    if (currentUser?.id) await upsertCartItem(currentUser.id, productId, item.qty);
  }
  updateCartUI();
}