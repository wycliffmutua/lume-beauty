// ═══════════════════════════════════════════
//  LUMÉ Beauty — cart.js
//  Handles: cart state (what's in it),
//           add / remove / quantity,
//           cart drawer open/close,
//           summary totals
// ═══════════════════════════════════════════

// ── CART STATE ────────────────────────────────────────
// This is just an array of product objects with a qty added.
// e.g. [{ id:1, name:"Velvet Matte Lipstick", price:3200, qty:2 }, ...]
let cart = [];

// ── ADD TO CART ───────────────────────────────────────
// Called from product card buttons (main.js injects onclick="addToCart(id)")
function addToCart(productId) {
  // Find the product in our PRODUCTS array (defined in main.js)
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  // Check if it's already in cart
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    // Already there — just increase quantity
    existingItem.qty++;
  } else {
    // New item — add it with qty 1
    cart.push({ ...product, qty: 1 });
    // ...product spreads all the product fields (name, price, image, etc.)
    // then we add qty: 1 on top
  }

  // Rebuild the cart UI
  updateCartUI();
  renderProducts(); // re-render so the button can show "in cart" state

  showToast(`${product.name} added to cart! 🛍`);
}

// ── REMOVE ONE ────────────────────────────────────────
// Decreases qty by 1. Removes item if qty reaches 0.
function removeOne(productId) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty--;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  updateCartUI();
  renderProducts(); // re-render so card button resets
}

// ── ADD ONE ───────────────────────────────────────────
// Increases qty by 1 (from cart drawer + button)
function addOne(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) item.qty++;
  updateCartUI();
}

// ── UPDATE CART UI ────────────────────────────────────
// Rebuilds the cart drawer body (items list) and footer (totals).
// Called every time cart changes.
function updateCartUI() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  // Update the badge on the Cart button in the header
  document.getElementById('cart-count').textContent = totalQty;

  const bodyEl = document.getElementById('cart-body');
  const footEl = document.getElementById('cart-foot');

  // ── EMPTY STATE ──
  if (cart.length === 0) {
    bodyEl.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        Your cart is empty.<br/>Start adding some products!
      </div>`;
    footEl.style.display = 'none';
    return;
  }

  // ── ITEMS LIST ──
  bodyEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
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

  // ── TOTALS ──
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = subtotal >= 5000 ? 0 : 350; // free shipping over KSh 5,000
  const total     = subtotal + shipping;

  document.getElementById('sum-subtotal').textContent = `KSh ${subtotal.toLocaleString()}`;
  document.getElementById('sum-shipping').textContent = shipping === 0
    ? '✓ FREE'
    : `KSh ${shipping}`;
  document.getElementById('sum-total').textContent = `KSh ${total.toLocaleString()}`;

  // Show footer
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

// ── CLOSE SHADE (clicking the dark overlay) ──────────
function closeShade() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('shade').classList.remove('on');
  document.getElementById('modal-overlay').classList.remove('on');
}

// ── GET TOTAL FOR MPESA ───────────────────────────────
// Called by mpesa.js to know how much to charge
function getCartTotal() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = subtotal >= 5000 ? 0 : 350;
  return subtotal + shipping;
}

// ── TOAST NOTIFICATION ────────────────────────────────
// Small popup at the bottom. Auto-hides after 2.8s.
// type can be '' (dark) or 'green'
let toastTimer;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
