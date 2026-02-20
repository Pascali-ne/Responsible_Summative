/*
  app.js
  ------
  This is the entry point of the application.
  It imports the state and UI modules, then starts the app
  when the page finishes loading.

  The order matters:
    1. First we load saved data from localStorage (initializeState)
    2. Then we build the UI and attach event listeners (ui.init)
*/

import * as state from './state.js';
import * as ui from './ui.js';

// Start the app
function startApp() {
  state.initializeState(); // Load saved data from localStorage
  ui.init();               // Set up the page and event listeners
}

// Wait for the HTML to be ready before starting
if (document.readyState === 'loading') {
  // Page is still loading — wait for it to finish
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  // Page already loaded (e.g. script placed at bottom of HTML)
  startApp();
}
