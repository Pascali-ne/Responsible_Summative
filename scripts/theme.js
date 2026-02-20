/*
  theme.js
  --------
  This module handles the Light / Dark theme toggle.
  It saves the user's choice to localStorage so their
  preference is remembered the next time they open the app.
*/

// Key used to store the theme preference in localStorage
const THEME_KEY = 'finance-tracker:theme';

// The default theme when the app first loads
const DEFAULT_THEME = 'light';

// ------------------------------------
// INITIALIZE THEME ON PAGE LOAD
// ------------------------------------

// Read the saved theme and set up the toggle buttons.
// Called once when the app starts.
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  setTheme(savedTheme);
  setupToggleButtons();
}

// ------------------------------------
// SET A SPECIFIC THEME
// ------------------------------------

// Apply the chosen theme by adding or removing the 'data-theme' attribute.
// CSS uses [data-theme="dark"] selectors to switch colors.
export function setTheme(theme) {
  const htmlElement = document.documentElement;

  if (theme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
  } else {
    // Light mode = no attribute needed (CSS defaults to light)
    htmlElement.removeAttribute('data-theme');
  }

  // Save the choice so it persists after refresh
  localStorage.setItem(THEME_KEY, theme);

  // Update the button pressed states
  updateButtonStates(theme);
}

// ------------------------------------
// SET UP TOGGLE BUTTON CLICK HANDLERS
// ------------------------------------

function setupToggleButtons() {
  const lightButton = document.getElementById('theme-light');
  const darkButton = document.getElementById('theme-dark');

  if (lightButton) {
    lightButton.addEventListener('click', function () {
      setTheme('light');
    });
  }

  if (darkButton) {
    darkButton.addEventListener('click', function () {
      setTheme('dark');
    });
  }
}

// ------------------------------------
// UPDATE BUTTON PRESSED STATE
// ------------------------------------

// Set aria-pressed="true" on the active button and "false" on the other.
// This tells screen readers which theme is currently active.
function updateButtonStates(theme) {
  const lightButton = document.getElementById('theme-light');
  const darkButton = document.getElementById('theme-dark');

  if (lightButton && darkButton) {
    const isLight = (theme === 'light');
    lightButton.setAttribute('aria-pressed', String(isLight));
    darkButton.setAttribute('aria-pressed', String(!isLight));
  }
}

// ------------------------------------
// GET CURRENT THEME
// ------------------------------------

// Returns 'dark' or 'light' based on the current attribute.
export function getTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  return current || 'light';
}
