// ═══════════════════════════════════════════
//  LUMÉ Beauty — Stage 2: Products & Filters
// ═══════════════════════════════════════════

// ── PRODUCT DATA ─────────────────────────────────────
// Each product has: id, name, brand, category,
// image (real URL), price, original_price, stock, offer
const PRODUCTS = [
  {
    id: 1,
    name: "Velvet Matte Lipstick",
    brand: "Charlotte Tilbury",
    category: "lips",
    image: "https://images.unsplash.com/photo-1586495777744-4e6232bf4e2d?w=400&q=80",
    price: 3200,
    original_price: 4000,
    stock: 18,
    offer: "20% OFF"
  },
  {
    id: 2,
    name: "Airbrush Foundation",
    brand: "NARS",
    category: "face",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    price: 5500,
    original_price: null,
    stock: 4,
    offer: null
  },
  {
    id: 3,
    name: "Brow Sculptor Pen",
    brand: "Benefit",
    category: "eyes",
    image: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400&q=80",
    price: 2800,
    original_price: null,
    stock: 0,
    offer: null
  },
  {
    id: 4,
    name: "Galaxy Highlighter",
    brand: "Fenty Beauty",
    category: "face",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    price: 3900,
    original_price: 5200,
    stock: 2,
    offer: "25% OFF"
  },
  {
    id: 5,
    name: "Hydra Glow Serum",
    brand: "The Ordinary",
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    price: 2200,
    original_price: null,
    stock: 35,
    offer: null
  },
  {
    id: 6,
    name: "Smoky Eye Palette",
    brand: "Urban Decay",
    category: "eyes",
    image: "https://images.unsplash.com/photo-1631214524020-3c69a4b654c9?w=400&q=80",
    price: 6800,
    original_price: 8500,
    stock: 3,
    offer: "20% OFF"
  },
  {
    id: 7,
    name: "Rose Blush Duo",
    brand: "NARS",
    category: "face",
    image: "https://images.unsplash.com/photo-1599733594230-6b823276d446?w=400&q=80",
    price: 4100,
    original_price: null,
    stock: 11,
    offer: null
  },
  {
    id: 8,
    name: "Volume Mascara",
    brand: "Maybelline",
    category: "eyes",
    image: "https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&q=80",
    price: 1800,
    original_price: 2400,
    stock: 0,
    offer: "25% OFF"
  },
  {
    id: 9,
    name: "Nude Lip Liner",
    brand: "MAC",
    category: "lips",
    image: "https://images.unsplash.com/photo-1586495777744-4e6232bf4e2d?w=400&q=80",
    price: 2100,
    original_price: null,
    stock: 1,
    offer: null
  },
  {
    id: 10,
    name: "Retinol Night Cream",
    brand: "CeraVe",
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    price: 3400,
    original_price: 4500,
    stock: 6,
    offer: "24% OFF"
  },
  {
    id: 11,
    name: "Setting Powder",
    brand: "Laura Mercier",
    category: "face",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    price: 4500,
    original_price: null,
    stock: 7,
    offer: null
  },
  {
    id: 12,
    name: "Vitamin C Toner",
    brand: "Klairs",
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    price: 2700,
    original_price: 3600,
    stock: 14,
    offer: "25% OFF"
  },
  {
    id: 13,
    name: "Gloss Bomb Lip",
    brand: "Fenty Beauty",
    category: "lips",
    image: "https://images.unsplash.com/photo-1586495777744-4e6232bf4e2d?w=400&q=80",
    price: 2600,
    original_price: 3200,
    stock: 3,
    offer: "19% OFF"
  },
  {
    id: 14,
    name: "Eyeliner Felt Tip",
    brand: "Stila",
    category: "eyes",
    image: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400&q=80",
    price: 1950,
    original_price: null,
    stock: 22,
    offer: null
  },
  {
    id: 15,
    name: "Pore Minimiser",
    brand: "Benefit",
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    price: 4200,
    original_price: 5600,
    stock: 5,
    offer: "25% OFF"
  },
  {
    id: 16,
    name: "Velvet Lip Gloss",
    brand: "MAC",
    category: "lips",
    image: "https://images.unsplash.com/photo-1586495777744-4e6232bf4e2d?w=400&q=80",
    price: 2400,
    original_price: null,
    stock: 9,
    offer: null
  }
];

// ── STATE (what the user has selected) ───────────────
let activeAlpha   = 'ALL';  // which letter filter is on
let activeCat     = 'all';  // which category is selected

// ── STOCK DISPLAY LOGIC ───────────────────────────────
// Returns what text, colour, and bar width to show based on stock number
function getStockInfo(stock) {
  if (stock === 0) {
    return { label: 'Out of Stock',        labelClass: 'label-grey',   barClass: 'bar-red',    barWidth: 0,   urgent: false };
  }
  if (stock === 1) {
    return { label: 'Only 1 remaining!',   labelClass: 'label-red',    barClass: 'bar-red',    barWidth: 5,   urgent: true  };
  }
  if (stock <= 3) {
    return { label: `Only ${stock} remaining!`, labelClass: 'label-red',  barClass: 'bar-red',  barWidth: 15,  urgent: true  };
  }
  if (stock <= 8) {
    return { label: `${stock} remaining`,  labelClass: 'label-yellow', barClass: 'bar-yellow', barWidth: 40,  urgent: false };
  }
  return   { label: `In Stock (${stock})`, labelClass: 'label-green',  barClass: 'bar-green',  barWidth: 100, urgent: false };
}

// ── BUILD A–Z FILTER ──────────────────────────────────
function buildAlpha() {
  const grid = document.getElementById('alpha-grid');
  grid.innerHTML = '';

  // "All" button
  const allBtn = document.createElement('button');
  allBtn.className = 'a-btn all-btn' + (activeAlpha === 'ALL' ? ' active' : '');
  allBtn.textContent = 'All';
  allBtn.onclick = () => { activeAlpha = 'ALL'; buildAlpha(); renderProducts(); };
  grid.appendChild(allBtn);

  // A to Z buttons
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'a-btn' + (activeAlpha === letter ? ' active' : '');
    btn.textContent = letter;
    btn.onclick = () => { activeAlpha = letter; buildAlpha(); renderProducts(); };
    grid.appendChild(btn);
  });
}

// ── CATEGORY FILTER ───────────────────────────────────
function filterCat(el, cat) {
  // Remove active from all cat items
  document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
  // Add active to clicked one
  el.classList.add('active');
  activeCat = cat;
  renderProducts();
}

// ── RENDER PRODUCTS ───────────────────────────────────
// This function reads all the filters and shows matching products
function renderProducts() {
  const searchText = document.getElementById('search-input').value.toLowerCase();
  const sortValue  = document.getElementById('sort-select').value;
  const priceRange = document.querySelector('input[name="price"]:checked').value;
  const dealsOnly  = document.getElementById('deals-toggle').checked;

  // 1. Filter
  let list = PRODUCTS.filter(p => {
    // Search match
    const matchSearch = p.name.toLowerCase().includes(searchText)
                     || p.brand.toLowerCase().includes(searchText);
    // Alpha match
    const matchAlpha  = activeAlpha === 'ALL'
                     || p.name.toUpperCase().startsWith(activeAlpha);
    // Category match
    const matchCat    = activeCat === 'all' || p.category === activeCat;
    // Price match
    let matchPrice = true;
    if (priceRange === 'low')  matchPrice = p.price < 2500;
    if (priceRange === 'mid')  matchPrice = p.price >= 2500 && p.price <= 5000;
    if (priceRange === 'high') matchPrice = p.price > 5000;
    // Deals match
    const matchDeals  = !dealsOnly || !!p.offer;

    return matchSearch && matchAlpha && matchCat && matchPrice && matchDeals;
  });

  // 2. Sort
  list.sort((a, b) => {
    if (sortValue === 'az')         return a.name.localeCompare(b.name);
    if (sortValue === 'price-low')  return a.price - b.price;
    if (sortValue === 'price-high') return b.price - a.price;
    return 0; // default: keep original order
  });

  // 3. Update count
  document.getElementById('result-count').textContent =
    `${list.length} product${list.length !== 1 ? 's' : ''}`;

  // 4. Render cards
  const grid = document.getElementById('product-grid');

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <span class="icon">🔍</span>
        No products match your filters.<br/>Try a different search or reset the filters.
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const stock   = getStockInfo(p.stock);
    const savings = p.original_price
      ? Math.round((1 - p.price / p.original_price) * 100)
      : 0;

    return `
      <div class="card ${p.stock === 0 ? 'sold-out' : ''}">

        ${p.offer ? `<div class="ribbon-offer">${p.offer}</div>` : ''}
        ${stock.urgent ? `<div class="ribbon-low">⚠ ${stock.label}</div>` : ''}

        <img class="card-img" src="${p.image}" alt="${p.name}" loading="lazy"/>

        <div class="card-body">
          <div class="card-cat">${p.category}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-brand">${p.brand}</div>

          <div class="price-row">
            <span class="price-now">KSh ${p.price.toLocaleString()}</span>
            ${p.original_price ? `
              <span class="price-was">KSh ${p.original_price.toLocaleString()}</span>
              <span class="price-save">-${savings}%</span>
            ` : ''}
          </div>

          <div class="stock-section">
            <div class="stock-bar-bg">
              <div class="stock-bar-fill ${stock.barClass}" style="width: ${stock.barWidth}%"></div>
            </div>
            <span class="stock-label ${stock.labelClass}">${stock.label}</span>
          </div>

<button class="add-btn" ${p.stock === 0 ? 'disabled' : ''} onclick="${p.stock > 0 ? `addToCart(${p.id})` : ''}">
            ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

      </div>`;
  }).join('');
}

// ── INIT — called by auth.js after login ─────────────
// We do NOT run this on page load anymore.
// auth.js calls initShop() once OTP is verified.
function initShop() {
  buildAlpha();
  renderProducts();
  console.log('LUMÉ Shop — ready ✅');
}
