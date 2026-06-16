// ═══════════════════════════════════════════
//  LUMÉ Beauty — auth.js
//  Now connected to Supabase Auth
// ═══════════════════════════════════════════

let currentUser  = null;
let pendingEmail = '';
let authMode     = 'login';
let demoOTP      = '';
let otpInterval  = null;

// ── SCREEN SWITCHING ─────────────────────────────────
function showScreen(id) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('otp-screen').style.display  = 'none';
  document.getElementById('app').style.display         = 'none';
  document.getElementById(id).style.display = 'block';
}

// ── AUTH MODE TOGGLE ─────────────────────────────────
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('field-name').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-err').textContent = '';
}

// ── SUBMIT AUTH FORM ─────────────────────────────────
async function doAuth() {
  const email = document.getElementById('inp-email').value.trim();
  const pass  = document.getElementById('inp-pass').value;
  const name  = document.getElementById('inp-name').value.trim();
  const errEl = document.getElementById('auth-err');
  errEl.textContent = '';

  if (authMode === 'signup' && !name) {
    errEl.textContent = 'Please enter your full name.'; return;
  }
  if (!email || !email.includes('@')) {
    errEl.textContent = 'Please enter a valid email address.'; return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.'; return;
  }

  if (authMode === 'signup') {
    // ── SIGN UP via Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } }
    });

    if (error) { errEl.textContent = error.message; return; }

    // Save to your users table
    await supabase.from('users').upsert({
      id:        data.user.id,
      email:     email,
      full_name: name
    });

  } else {
    // ── LOG IN via Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { errEl.textContent = error.message; return; }
  }

  pendingEmail = email;
  sendOTP();
}

// ── GENERATE + DISPLAY OTP ────────────────────────────
function sendOTP() {
  demoOTP = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('otp-email-label').textContent  = pendingEmail;
  document.getElementById('demo-otp-display').textContent = demoOTP;
  document.getElementById('otp-err').textContent = '';
  document.querySelectorAll('.otp-box').forEach(b => b.value = '');
  showScreen('otp-screen');
  document.querySelectorAll('.otp-box')[0].focus();
  startOTPTimer(60);
}

function resendOTP() {
  sendOTP();
  showToast('New code sent! 📩');
}

function startOTPTimer(seconds) {
  clearInterval(otpInterval);
  const el = document.getElementById('otp-timer');
  let t = seconds;
  el.textContent = `(${t}s)`;
  otpInterval = setInterval(() => {
    t--;
    if (t <= 0) { clearInterval(otpInterval); el.textContent = ''; }
    else el.textContent = `(${t}s)`;
  }, 1000);
}

// ── VERIFY OTP ────────────────────────────────────────
function verifyOTP() {
  const entered = Array.from(document.querySelectorAll('.otp-box'))
    .map(b => b.value).join('');
  const errEl = document.getElementById('otp-err');

  if (entered.length < 6) { errEl.textContent = 'Please enter all 6 digits.'; return; }
  if (entered !== demoOTP) {
    errEl.textContent = 'Incorrect code. Try again or resend.';
    document.querySelectorAll('.otp-box').forEach(b => {
      b.value = '';
      b.style.borderColor = '#a02020';
    });
    setTimeout(() => {
      document.querySelectorAll('.otp-box').forEach(b => b.style.borderColor = '');
    }, 700);
    document.querySelectorAll('.otp-box')[0].focus();
    return;
  }

  clearInterval(otpInterval);
  launchApp();
}

// ── LAUNCH THE APP ────────────────────────────────────
async function launchApp() {
  // Get the logged in user from Supabase
  const { data: { user } } = await supabase.auth.getUser();

  currentUser = {
    id:    user.id,
    email: user.email,
    name:  user.user_metadata?.full_name || user.email.split('@')[0]
  };

  showScreen('app');
  document.getElementById('user-name-label').textContent = currentUser.name;
  document.getElementById('user-av').textContent = currentUser.name.charAt(0).toUpperCase();

  // Load products from DB instead of hardcoded array
  window.PRODUCTS = await fetchProducts();

  // Load saved cart from DB
  cart = await loadCart(currentUser.id);
  updateCartUI();

  initShop();
  showToast(`Welcome, ${currentUser.name}! 🌸`, 'green');
}

// ── SIGN OUT ──────────────────────────────────────────
async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
  cart = [];
  updateCartUI();
  showScreen('auth-screen');
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-pass').value  = '';
  document.getElementById('inp-name').value  = '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── OTP BOX KEYBOARD NAVIGATION ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const boxes = document.querySelectorAll('.otp-box');

  boxes.forEach((box, i) => {
    box.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '');
      box.value = val.slice(-1);
      if (val && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'Enter') verifyOTP();
    });
    box.addEventListener('paste', e => {
      const data = e.clipboardData.getData('text').replace(/\D/g, '');
      data.split('').slice(0, 6).forEach((ch, j) => {
        if (boxes[j]) boxes[j].value = ch;
      });
      boxes[Math.min(data.length, 5)].focus();
      e.preventDefault();
    });
  });

  // Auto login if session exists
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) launchApp();
  });
});