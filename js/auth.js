// ═══════════════════════════════════════════
//  LUMÉ Beauty — auth.js
//  Handles: Login form, OTP verification,
//           showing/hiding screens,
//           sign out
// ═══════════════════════════════════════════

// ── STATE ────────────────────────────────────────────
// These variables are available to all scripts
// because they're declared at the top level (global)
let currentUser  = null;   // { name, email } — set after login
let pendingEmail = '';     // email waiting for OTP
let authMode     = 'login'; // 'login' or 'signup'
let demoOTP      = '';     // the code we generated (shown in demo box)
let otpInterval  = null;   // holds the countdown timer

// ── SCREEN SWITCHING ─────────────────────────────────
// We have 3 screens: auth-screen, otp-screen, app
// Only one is visible at a time — we toggle display:block/none

function showScreen(id) {
  // Hide all three
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('otp-screen').style.display  = 'none';
  document.getElementById('app').style.display          = 'none';
  // Show the one we want
  document.getElementById(id).style.display = 'block';
}

// ── AUTH MODE TOGGLE (Sign In ↔ New Account) ─────────
function setAuthMode(mode) {
  authMode = mode;

  // Update which tab looks active
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');

  // Show name field only for signup
  document.getElementById('field-name').style.display = mode === 'signup' ? 'block' : 'none';

  // Clear any old error message
  document.getElementById('auth-err').textContent = '';
}

// ── SUBMIT AUTH FORM ─────────────────────────────────
// Called when user clicks "Send Verification Code"
function doAuth() {
  const email = document.getElementById('inp-email').value.trim();
  const pass  = document.getElementById('inp-pass').value;
  const name  = document.getElementById('inp-name').value.trim();
  const errEl = document.getElementById('auth-err');

  // Clear old errors
  errEl.textContent = '';

  // Validate
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

  // Save who is trying to log in
  pendingEmail = email;

  // Set the current user's name:
  // — Signup: use what they typed
  // — Login: use the part before @ in their email
  const rawName = authMode === 'signup' ? name : email.split('@')[0];
  currentUser = { name: capitalize(rawName), email };

  // Generate and "send" the OTP
  sendOTP();
}

// ── GENERATE + DISPLAY OTP ────────────────────────────
// In production, this calls your backend which emails the code.
// In demo mode, we just generate it locally and show it on screen.
function sendOTP() {
  // Generate a random 6-digit number
  demoOTP = String(Math.floor(100000 + Math.random() * 900000));

  // ↓ PRODUCTION: replace above with a fetch() to your backend:
  // fetch('/auth/login', { method:'POST', body: JSON.stringify({email, password}) })
  // The backend sends the real OTP via SendGrid email

  // Show the OTP screen
  document.getElementById('otp-email-label').textContent = pendingEmail;
  document.getElementById('demo-otp-display').textContent = demoOTP;
  document.getElementById('otp-err').textContent = '';

  // Clear any old digits in the boxes
  document.querySelectorAll('.otp-box').forEach(b => b.value = '');

  showScreen('otp-screen');

  // Focus first box
  document.querySelectorAll('.otp-box')[0].focus();

  // Start 60-second resend countdown
  startOTPTimer(60);
}

// ── RESEND CODE ───────────────────────────────────────
function resendOTP() {
  sendOTP(); // just regenerate and reset
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
// Called when user clicks "Verify & Enter Store"
function verifyOTP() {
  // Collect all 6 digits into one string
  const entered = Array.from(document.querySelectorAll('.otp-box'))
    .map(b => b.value)
    .join('');

  const errEl = document.getElementById('otp-err');

  if (entered.length < 6) {
    errEl.textContent = 'Please enter all 6 digits.';
    return;
  }

  if (entered !== demoOTP) {
    // Wrong code — shake and clear
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

  // ✅ CORRECT — let them in!
  clearInterval(otpInterval);
  launchApp();
}

// ── LAUNCH THE APP ────────────────────────────────────
// Called after OTP is verified.
// Shows the store, sets the user's name in the header,
// and calls initShop() from main.js to load products.
function launchApp() {
  showScreen('app');

  // Set user details in the header
  document.getElementById('user-name-label').textContent = currentUser.name;
  document.getElementById('user-av').textContent          = currentUser.name.charAt(0).toUpperCase();

  // Load the product grid and filters
  initShop();

  showToast(`Welcome, ${currentUser.name}! 🌸`, 'green');
}

// ── SIGN OUT ─────────────────────────────────────────
function signOut() {
  // Clear all state
  currentUser  = null;
  pendingEmail = '';
  cart         = [];     // from cart.js
  updateCartUI();        // from cart.js — resets the cart drawer

  // Go back to login screen
  showScreen('auth-screen');

  // Clear form fields
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-pass').value  = '';
  document.getElementById('inp-name').value  = '';
}

// ── HELPER ───────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── OTP BOX KEYBOARD NAVIGATION ──────────────────────
// Runs once DOM is ready.
// Makes the 6 OTP boxes auto-advance, backspace, and paste nicely.
document.addEventListener('DOMContentLoaded', () => {
  const boxes = document.querySelectorAll('.otp-box');

  boxes.forEach((box, i) => {
    // As user types a digit, move to next box
    box.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, ''); // only digits
      box.value = val.slice(-1);                     // keep only last digit
      if (val && i < boxes.length - 1) boxes[i + 1].focus();
    });

    // Backspace on empty box → go back
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'Enter') verifyOTP();
    });

    // Paste the whole 6-digit code at once
    box.addEventListener('paste', e => {
      const data = e.clipboardData.getData('text').replace(/\D/g, '');
      data.split('').slice(0, 6).forEach((ch, j) => {
        if (boxes[j]) boxes[j].value = ch;
      });
      boxes[Math.min(data.length, 5)].focus();
      e.preventDefault();
    });
  });
});
