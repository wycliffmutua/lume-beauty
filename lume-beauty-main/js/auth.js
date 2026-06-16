// ═══════════════════════════════════════════
//  LUMÉ Beauty — auth.js
//  Handles: Login form, OTP verification,
//           showing/hiding screens,
//           sign out
// ═══════════════════════════════════════════

// ── STATE ────────────────────────────────────────────
let currentUser  = null;
let pendingEmail = '';
let authMode     = 'login';
let demoOTP      = '';
let otpInterval  = null;

// ── SCREEN SWITCHING ─────────────────────────────────
function showScreen(id) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('otp-screen').style.display  = 'none';
  document.getElementById('app').style.display          = 'none';
  document.getElementById(id).style.display = 'block';
}

// ── AUTH MODE TOGGLE ──────────────────────────────────
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('field-name').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-err').textContent = '';
}

// ── SUBMIT AUTH FORM ──────────────────────────────────
function doAuth() {
  const email = document.getElementById('inp-email').value.trim();
  const pass  = document.getElementById('inp-pass').value;
  const name  = document.getElementById('inp-name').value.trim();
  const errEl = document.getElementById('auth-err');

  errEl.textContent = '';

  if (authMode === 'signup' && !name) {
    errEl.textContent = 'Please enter your full name.';
    return;
  }
  if (!email || !email.includes('@')) {
    errEl.textContent = 'Please enter a valid email address.';
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  pendingEmail = email;
  const rawName = authMode === 'signup' ? name : email.split('@')[0];
  currentUser = { name: capitalize(rawName), email };

  sendOTP();
}

// ── GENERATE + DISPLAY OTP ────────────────────────────
function sendOTP() {
  demoOTP = String(Math.floor(100000 + Math.random() * 900000));

  document.getElementById('otp-email-label').textContent = pendingEmail;
  document.getElementById('demo-otp-display').textContent = demoOTP;
  document.getElementById('otp-err').textContent = '';

  document.querySelectorAll('.otp-box').forEach(b => b.value = '');

  showScreen('otp-screen');
  document.querySelectorAll('.otp-box')[0].focus();
  startOTPTimer(60);
}

// ── RESEND CODE ───────────────────────────────────────
function resendOTP() {
  sendOTP();
  showToast('New code sent! 📩');
}

// ── COUNTDOWN TIMER ───────────────────────────────────
function startOTPTimer(seconds) {
  clearInterval(otpInterval);
  const el = document.getElementById('otp-timer');
  let t = seconds;
  el.textContent = `(${t}s)`;
  otpInterval = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(otpInterval);
      el.textContent = '';
    } else {
      el.textContent = `(${t}s)`;
    }
  }, 1000);
}

// ── VERIFY OTP ────────────────────────────────────────
function verifyOTP() {
  const entered = Array.from(document.querySelectorAll('.otp-box'))
    .map(b => b.value)
    .join('');

  const errEl = document.getElementById('otp-err');

  if (entered.length < 6) {
    errEl.textContent = 'Please enter all 6 digits.';
    return;
  }

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
function launchApp() {
  // Save login state so refresh doesn't log user out
  localStorage.setItem('lumeUser', JSON.stringify(currentUser));

  showScreen('app');
  document.getElementById('user-name-label').textContent = currentUser.name;
  document.getElementById('user-av').textContent = currentUser.name.charAt(0).toUpperCase();
  initShop();
  showToast(`Welcome, ${currentUser.name}! 🌸`, 'green');
}

// ── SIGN OUT ──────────────────────────────────────────
function signOut() {
  // Clear saved login
  localStorage.removeItem('lumeUser');

  currentUser  = null;
  pendingEmail = '';
  cart         = [];
  updateCartUI();

  showScreen('auth-screen');
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-pass').value  = '';
  document.getElementById('inp-name').value  = '';
}

// ── HELPER ────────────────────────────────────────────
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

  // ── AUTO LOGIN ON REFRESH ───────────────────────────
  // If user was already logged in, skip the login screen
  const saved = localStorage.getItem('lumeUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    launchApp();
  }
});
