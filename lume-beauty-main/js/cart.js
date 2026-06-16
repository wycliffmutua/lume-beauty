// ═══════════════════════════════════════════
//  LUMÉ Beauty — cart.js
// ═══════════════════════════════════════════

// ── CART STATE ────────────────────────────────────────
let cart = [];

// ── ADD TO CART ───────────────────────────────────────
async function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  const item = cart.find(i => i.id === productId);
  if (currentUser?.id) {
    await upsertCartItem(currentUser.id, productId, item.qty);
  }

  updateCartUI();
  renderProducts();
  showToast(`${product.name} added to cart! 🛍`);
}

// ── REMOVE ONE ────────────────────────────────────────
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

// ── ADD ONE ───────────────────────────────────────────
async function addOne(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty++;
    if (currentUser?.id) await upsertCartItem(currentUser.id, productId, item.qty);
  }
  updateCartUI();
}

// ── UPDATE CART UI ────────────────────────────────────
function updateCartUI() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cart-count').textContent = totalQty;

  const bodyEl = document.getElementById('cart-body');
  const footEl = document.getElementById('cart-foot');

  if (cart.length === 0) {
    bodyEl.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        Your cart is empty.<br/>Start adding some products!
      </div>`;
    footEl.style.display = 'none';
    return;
  }

  bodyEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image_url || item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-row">
          <span class="cart-item-price">KSh ${(item.price * item.qty).toLocaleString()}</span>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="removeOne(${item.id})">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="addOne(${item.id})">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = subtotal >= 5000 ? 0 : 350;
  const total     = subtotal + shipping;

  document.getElementById('sum-subtotal').textContent = `KSh ${subtotal.toLocaleString()}`;
  document.getElementById('sum-shipping').textContent = shipping === 0 ? '✓ FREE' : `KSh ${shipping}`;
  document.getElementById('sum-total').textContent    = `KSh ${total.toLocaleString()}`;

  footEl.style.display = 'block';
}

// ── CART DRAWER OPEN / CLOSE ─────────────────────────
function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  const shade  = document.getElementById('shade');
  const isOpen = drawer.classList.contains('open');

  if (isOpen) {
    drawer.classList.remove('open');
    shade.classList.remove('on');
  } else {
    drawer.classList.add('open');
    shade.classList.add('on');
  }
}

// ── CLOSE SHADE ───────────────────────────────────────
function closeShade() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('shade').classList.remove('on');
  document.getElementById('modal-overlay').classList.remove('on');
}

// ── GET TOTAL FOR MPESA ───────────────────────────────
function getCartTotal() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = subtotal >= 5000 ? 0 : 350;
  return subtotal + shipping;
}

// ── TOAST NOTIFICATION ────────────────────────────────
let toastTimer;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}