/*
  ui.js
  -----
  This module handles everything the user sees and interacts with.
  It reads from the state module and updates the HTML on the page.

  Sections:
    1. init()              — sets everything up on page load
    2. Navigation          — switching between sections
    3. Form (Add/Edit)     — the Add Transaction form
    4. Search & Sort       — the search box and sort dropdown
    5. Settings            — currency rates, import/export
    6. Budget Cap          — the monthly spending limit
    7. Render Records      — shows the list of transactions
    8. Render Dashboard    — shows the stats and charts
    9. Event Delegation    — handles clicks on records and category buttons
*/

import * as state from './state.js';
import * as validators from './validators.js';
import * as search from './search.js';
import * as theme from './theme.js';

// Currency symbols for display
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£' };

// Get the symbol for the current base currency (e.g. '$', '€', '£')
function getCurrencySymbol() {
  const base = state.state.settings && state.state.settings.baseCurrency
    ? state.state.settings.baseCurrency
    : 'USD';
  return CURRENCY_SYMBOLS[base] || base;
}

// ============================================================
// 1. INIT — Called once when the page loads
// ============================================================

export function init() {
  theme.initTheme();             // Apply saved light/dark theme
  setupNavigation();             // Wire up nav link clicks
  setupForm();                   // Wire up the Add Transaction form
  setupSearch();                 // Wire up search box and sort dropdown
  setupSettings();               // Wire up settings buttons
  setupBudgetCap();              // Wire up the budget cap button
  setupRecordsDelegation();      // Wire up click handling for Edit/Delete buttons
  setupCategoriesDelegation();   // Wire up click handling for Remove category buttons
  renderAll();                   // Draw everything on the screen
}

// ============================================================
// 2. NAVIGATION
// ============================================================

// Set up all nav links to show/hide the correct section when clicked.
function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-nav]');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the link from jumping the page

      const sectionId = link.dataset.nav; // e.g. "dashboard"
      showSection(sectionId);
      highlightActiveNavLink(sectionId);
    });
  });

  // If there's a #hash in the URL (e.g. #records), show that section
  const hashSection = window.location.hash.slice(1);
  if (hashSection) {
    showSection(hashSection);
    highlightActiveNavLink(hashSection);
  }
}

// Show one section and hide all others.
function showSection(sectionId) {
  // Hide every section
  const allSections = document.querySelectorAll('.section');
  allSections.forEach(function (section) {
    section.classList.remove('active');
  });

  // Show only the target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    window.location.hash = sectionId; // Update the URL hash
  }
}

// Add the 'active' style to the clicked nav link and remove it from others.
function highlightActiveNavLink(sectionId) {
  const navLinks = document.querySelectorAll('[data-nav]');
  navLinks.forEach(function (link) {
    link.classList.remove('active');
  });

  const activeLink = document.querySelector('[data-nav="' + sectionId + '"]');
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// ============================================================
// 3. FORM — Add / Edit Transaction
// ============================================================

function setupForm() {
  const form = document.getElementById('transaction-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const descInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  const dateInput = document.getElementById('date');

  // Attach form submit handler
  form.addEventListener('submit', handleFormSubmit);

  // Cancel button resets the form
  cancelBtn.addEventListener('click', resetForm);

  // Validate each field when the user leaves it (on blur)
  descInput.addEventListener('blur', function () {
    validateSingleField('description', descInput.value);
  });
  amountInput.addEventListener('blur', function () {
    validateSingleField('amount', amountInput.value);
  });
  categorySelect.addEventListener('change', function () {
    validateSingleField('category', categorySelect.value);
  });
  dateInput.addEventListener('blur', function () {
    validateSingleField('date', dateInput.value);
  });

  // Set the date field to today's date by default
  dateInput.value = getTodayDate();
}

// Return today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Validate a single form field and show/clear the error message.
function validateSingleField(fieldName, value) {
  const errorElement = document.getElementById(fieldName + '-error');
  const inputElement = document.getElementById(fieldName);

  // Pick the right validator based on the field
  let result;
  if (fieldName === 'description') {
    result = validators.validateDescription(value);
  } else if (fieldName === 'amount') {
    result = validators.validateAmount(value);
  } else if (fieldName === 'date') {
    result = validators.validateDate(value);
  } else if (fieldName === 'category') {
    result = validators.validateCategory(value);
  }

  if (result.valid) {
    errorElement.textContent = '';          // Clear error
    inputElement.classList.remove('error'); // Remove red border
  } else {
    errorElement.textContent = result.message; // Show error message
    inputElement.classList.add('error');        // Add red border
  }

  return result.valid;
}

// Handle the form being submitted (Add or Update transaction).
function handleFormSubmit(event) {
  event.preventDefault(); // Don't reload the page

  // Read values from the form fields
  const formData = {
    description: document.getElementById('description').value,
    amount: document.getElementById('amount').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  // Validate all fields at once
  const validation = validators.validateTransaction(formData);

  if (!validation.valid) {
    // Show errors under each invalid field
    const fieldNames = Object.keys(validation.errors);
    for (let i = 0; i < fieldNames.length; i++) {
      const field = fieldNames[i];
      const message = validation.errors[field];
      const errorEl = document.getElementById(field + '-error');
      const inputEl = document.getElementById(field);
      errorEl.textContent = message;
      inputEl.classList.add('error');
    }
    return; // Stop — don't save if there are errors
  }

  // Save or update the transaction
  if (state.state.editingId) {
    // We're editing an existing transaction
    state.updateTransaction(state.state.editingId, formData);
    state.state.editingId = null;
  } else {
    // We're adding a brand new transaction
    state.addTransaction(formData);
  }

  resetForm();
  renderRecords();
  renderDashboard();
  showSection('records'); // Go to Records after saving
}

// Clear all form fields and error messages.
function resetForm() {
  const form = document.getElementById('transaction-form');
  form.reset();

  // Clear any leftover error messages and red borders
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(function (el) { el.textContent = ''; });

  const errorInputs = document.querySelectorAll('.error');
  errorInputs.forEach(function (el) { el.classList.remove('error'); });

  // Reset date to today and button text to "Add"
  document.getElementById('date').value = getTodayDate();
  document.getElementById('submit-btn').textContent = 'Add Transaction';

  state.state.editingId = null;
}

// ============================================================
// 4. SEARCH, SORT, FILTER
// ============================================================

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const caseSensitive = document.getElementById('search-case');
  const sortSelect = document.getElementById('sort-select');
  const categoryFilter = document.getElementById('category-filter');

  // Debounce search: wait 200ms after user stops typing before searching.
  // This avoids re-rendering after every single keystroke.
  let searchDelay;
  searchInput.addEventListener('input', function () {
    clearTimeout(searchDelay);
    searchDelay = setTimeout(handleSearch, 200);
  });

  caseSensitive.addEventListener('change', handleSearch);
  sortSelect.addEventListener('change', handleSort);
  categoryFilter.addEventListener('change', handleCategoryFilter);
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const caseSensitive = document.getElementById('search-case').checked;

  // Compile the search pattern (safely — invalid patterns return null)
  state.state.currentFilter.searchRegex = search.compileRegex(searchInput.value, caseSensitive);
  renderRecords();
}

function handleSort() {
  const sortSelect = document.getElementById('sort-select');
  state.state.currentFilter.sortBy = sortSelect.value;
  renderRecords();
}

function handleCategoryFilter() {
  const categoryFilter = document.getElementById('category-filter');
  state.state.currentFilter.category = categoryFilter.value;
  renderRecords();
}

// ============================================================
// 5. SETTINGS
// ============================================================

function setupSettings() {
  document.getElementById('export-btn').addEventListener('click', handleExport);
  document.getElementById('import-file').addEventListener('change', handleImport);
  document.getElementById('clear-btn').addEventListener('click', handleClearData);
  document.getElementById('save-rates-btn').addEventListener('click', handleSaveRates);
  document.getElementById('add-category-btn').addEventListener('click', handleAddCategory);
}

// Download all data as a JSON file
function handleExport() {
  const data = state.exportData();
  const jsonText = JSON.stringify(data, null, 2); // Pretty-print with 2 spaces

  // Create a temporary download link and click it
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'finance-tracker-' + getTodayDate() + '.json';
  link.click();

  URL.revokeObjectURL(url); // Clean up the temporary URL
}

// Load transactions from an uploaded JSON file
function handleImport(event) {
  const file = event.target.files[0];
  const statusEl = document.getElementById('import-status');

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    try {
      const data = JSON.parse(loadEvent.target.result);
      const validation = validators.validateImportData(data);

      if (!validation.valid) {
        statusEl.textContent = 'Import failed: ' + validation.message;
        statusEl.className = 'error-message';
        return;
      }

      const result = state.importData(data);

      if (result.success) {
        statusEl.textContent = 'Data imported successfully!';
        statusEl.className = 'success-message';
        renderAll();
      } else {
        statusEl.textContent = 'Import failed: ' + result.message;
        statusEl.className = 'error-message';
      }
    } catch (parseError) {
      statusEl.textContent = 'Error: the file is not valid JSON';
      statusEl.className = 'error-message';
    }

    // Clear the status message after 5 seconds
    setTimeout(function () {
      statusEl.textContent = '';
      statusEl.className = '';
    }, 5000);
  };

  reader.readAsText(file);
  event.target.value = ''; // Reset file input so the same file can be re-imported
}

// Clear all data — uses two-click pattern instead of confirm() dialog
function handleClearData() {
  const clearBtn = document.getElementById('clear-btn');

  if (clearBtn.dataset.confirming === 'true') {
    // This is the SECOND click — user confirmed, wipe the data
    clearBtn.dataset.confirming = 'false';
    clearBtn.textContent = 'Clear All Data';
    state.clearAllData();
    renderAll();
    showToast('All data cleared.', 'warning');
  } else {
    // This is the FIRST click — warn the user, wait for second click
    clearBtn.dataset.confirming = 'true';
    clearBtn.textContent = 'Click again to confirm';
    clearBtn.setAttribute('aria-label', 'Confirm: click again to permanently delete all data');

    // Auto-reset if no second click happens within 4 seconds
    setTimeout(function () {
      if (clearBtn.dataset.confirming === 'true') {
        clearBtn.dataset.confirming = 'false';
        clearBtn.textContent = 'Clear All Data';
        clearBtn.setAttribute('aria-label', '');
      }
    }, 4000);
  }
}

// Save the currency rates from the Settings form
function handleSaveRates() {
  const newSettings = {
    baseCurrency: document.getElementById('base-currency').value,
    rates: {
      USD: parseFloat(document.getElementById('usd-rate').value),
      EUR: parseFloat(document.getElementById('eur-rate').value),
      GBP: parseFloat(document.getElementById('gbp-rate').value)
    }
  };

  state.updateSettings(newSettings);
  showToast('Currency rates saved!'); // Shows a non-blocking notification
}

// Add a custom category from the Settings form
function handleAddCategory() {
  const input = document.getElementById('new-category');
  const errorEl = document.getElementById('category-add-error');
  const value = input.value.trim();

  const validation = validators.validateCategory(value);

  if (!validation.valid) {
    errorEl.textContent = validation.message;
    return;
  }

  if (state.state.categories.includes(value)) {
    errorEl.textContent = 'That category already exists';
    return;
  }

  state.addCategory(value);
  input.value = '';
  errorEl.textContent = '';

  renderCategories();
  updateCategorySelects();
}

// ============================================================
// 6. BUDGET CAP
// ============================================================

function setupBudgetCap() {
  const setCapBtn = document.getElementById('set-cap-btn');

  setCapBtn.addEventListener('click', function () {
    const capInput = document.getElementById('budget-cap-input');
    const capAmount = parseFloat(capInput.value) || 0;
    state.setBudgetCap(capAmount);
    renderBudgetCap();
  });
}

// ============================================================
// 7. RENDER RECORDS (Transaction List)
// ============================================================

function renderRecords() {
  const container = document.getElementById('records-container');
  const statusEl = document.getElementById('search-status');
  const allCount = state.state.transactions.length;

  // Step 1: Apply filters and sort
  let transactions = state.state.transactions;
  transactions = search.filterByCategory(transactions, state.state.currentFilter.category);
  transactions = search.searchTransactions(transactions, state.state.currentFilter.searchRegex);
  transactions = search.sortTransactions(transactions, state.state.currentFilter.sortBy);

  // Step 2: Update the screen reader live region with the result count
  if (statusEl) {
    const hasActiveFilter = state.state.currentFilter.searchRegex || state.state.currentFilter.category;
    if (hasActiveFilter) {
      statusEl.textContent = 'Showing ' + transactions.length + ' of ' + allCount + ' transactions';
    } else {
      const word = transactions.length === 1 ? 'transaction' : 'transactions';
      statusEl.textContent = transactions.length + ' ' + word;
    }
  }

  // Step 3: Show empty state if no results
  if (transactions.length === 0) {
    container.innerHTML = '<p class="empty-state">No transactions found. Try adjusting your filters.</p>';
    return;
  }

  // Step 4: Build the HTML for each transaction card
  const currentRegex = state.state.currentFilter.searchRegex;
  const symbol = getCurrencySymbol();
  let cardsHtml = '';

  for (let i = 0; i < transactions.length; i++) {
    const txn = transactions[i];

    // Highlight matching text in each field
    const descriptionHtml = search.highlight(txn.description, currentRegex);
    const amountHtml = search.highlight(txn.amount.toFixed(2), currentRegex);
    const categoryHtml = search.highlight(txn.category, currentRegex);
    const dateHtml = search.highlight(txn.date, currentRegex);

    cardsHtml += `
      <div class="record-card" data-id="${txn.id}">
        <div>
          <div class="record-header">
            <span class="record-description">${descriptionHtml}</span>
            <span class="record-amount">${symbol}${amountHtml}</span>
          </div>
          <div class="record-meta">
            <span class="record-category">${categoryHtml}</span>
            <span class="record-date">${dateHtml}</span>
          </div>
        </div>
        <div class="record-actions">
          <button data-action="edit" data-id="${txn.id}" aria-label="Edit ${txn.description}">Edit</button>
          <button data-action="delete" data-id="${txn.id}" class="danger" aria-label="Delete ${txn.description}">Delete</button>
        </div>
      </div>
    `;
  }

  container.innerHTML = cardsHtml;
}

// ============================================================
// 8. RENDER DASHBOARD (Stats + Charts)
// ============================================================

function renderDashboard() {
  const stats = state.calculateStats();
  const symbol = getCurrencySymbol();

  // Update the four stat cards
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-expenses').textContent = symbol + stats.totalExpenses.toFixed(2);
  document.getElementById('stat-top-category').textContent = stats.topCategory;
  document.getElementById('stat-week').textContent = symbol + stats.weekTotal.toFixed(2);

  // Draw the 7-day bar chart
  renderTrendChart(stats.dailyTotals);
}

// Draw the 7-day spending bar chart
function renderTrendChart(dailyTotals) {
  const container = document.getElementById('trend-bars');
  const symbol = getCurrencySymbol();

  // Find the highest single-day amount (used to scale bar heights)
  const values = Object.values(dailyTotals);
  const maxValue = Math.max.apply(null, values.concat([1])); // At least 1 to avoid divide-by-zero

  let barsHtml = '';
  const dates = Object.keys(dailyTotals);

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const amount = dailyTotals[date];

    // Calculate height as a percentage of the tallest bar
    const heightPercent = Math.max((amount / maxValue) * 100, 2);

    // Get the day name (e.g. "Mon") — add T12:00:00 to avoid timezone shift
    const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });

    barsHtml += `
      <div
        class="trend-bar"
        style="height: ${heightPercent}%"
        title="${dayName}: ${symbol}${amount.toFixed(2)}"
        role="img"
        aria-label="${dayName}: ${symbol}${amount.toFixed(2)}"
      >
        <span class="trend-bar-label" aria-hidden="true">${dayName}</span>
      </div>
    `;
  }

  container.innerHTML = barsHtml;
}

// Draw the spending-by-category horizontal bar chart
function renderCategoryBreakdown() {
  const container = document.getElementById('category-breakdown');
  if (!container) return;

  const transactions = state.getTransactions();
  const symbol = getCurrencySymbol();

  // Add up spending for each category
  const categoryTotals = {};
  for (let i = 0; i < transactions.length; i++) {
    const cat = transactions[i].category;
    const amount = transactions[i].amount;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] += amount;
  }

  // Sort categories from highest to lowest spending
  const sorted = Object.entries(categoryTotals).sort(function (a, b) {
    return b[1] - a[1];
  });

  if (sorted.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">No data yet.</p>';
    return;
  }

  const topAmount = sorted[0][1]; // Highest amount (used to scale bars)
  let html = '';

  for (let i = 0; i < sorted.length; i++) {
    const category = sorted[i][0];
    const amount = sorted[i][1];
    const widthPct = (amount / topAmount) * 100;

    html += `
      <div class="category-item">
        <div class="category-item-label">${category}</div>
        <div class="category-item-bar">
          <div class="category-item-fill" style="width: ${widthPct}%">
            <span class="category-item-amount">${symbol}${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Draw the monthly spending trend bar chart (last 6 months)
function renderMonthlyTrend() {
  const container = document.getElementById('monthly-chart');
  if (!container) return;

  const transactions = state.getTransactions();
  const symbol = getCurrencySymbol();

  // Group transactions by month (e.g. "2025-09")
  const monthlyTotals = {};
  for (let i = 0; i < transactions.length; i++) {
    const date = new Date(transactions[i].date);
    const year = date.getFullYear();
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = year + '-' + monthNum;

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    monthlyTotals[monthKey] += transactions[i].amount;
  }

  // Sort months chronologically and keep only the last 6
  const sortedEntries = Object.entries(monthlyTotals).sort(function (a, b) {
    return a[0].localeCompare(b[0]);
  });
  const lastSixMonths = sortedEntries.slice(-6);

  if (lastSixMonths.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">No data yet — add some transactions!</p>';
    return;
  }

  const maxAmount = Math.max.apply(null, lastSixMonths.map(function (m) { return m[1]; }));
  let html = '';

  for (let i = 0; i < lastSixMonths.length; i++) {
    const monthKey = lastSixMonths[i][0];
    const amount = lastSixMonths[i][1];

    const parts = monthKey.split('-');
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const monthName = new Date(year, monthIndex).toLocaleDateString('en-US', { month: 'short' });

    const heightPct = (amount / maxAmount) * 100;

    // Calculate trend compared to previous month
    let trendClass = '';
    let trendIcon = '';
    let trendLabel = '';

    if (i > 0) {
      const prevAmount = lastSixMonths[i - 1][1];
      if (amount > prevAmount) {
        trendClass = 'trend-up';
        trendIcon = '↑';
        trendLabel = ' — spending increased';
      } else if (amount < prevAmount) {
        trendClass = 'trend-down';
        trendIcon = '↓';
        trendLabel = ' — spending decreased';
      }
    }

    html += `
      <div
        class="monthly-bar"
        role="img"
        aria-label="${monthName} ${year}: ${symbol}${amount.toFixed(0)}${trendLabel}"
      >
        <div class="monthly-bar-column ${trendClass}" style="height: ${heightPct}%">
          <span class="monthly-bar-amount" aria-hidden="true">${symbol}${amount.toFixed(0)}</span>
          <span class="monthly-bar-trend"  aria-hidden="true">${trendIcon}</span>
        </div>
        <div class="monthly-bar-label" aria-hidden="true">${monthName} '${year.slice(2)}</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Show/update the budget cap progress bar and status message
function renderBudgetCap() {
  const stats = state.calculateStats();
  const cap = stats.budgetCap;    // Monthly limit
  const spent = stats.totalExpenses; // Total amount spent
  const symbol = getCurrencySymbol();

  const capInput = document.getElementById('budget-cap-input');
  const statusEl = document.getElementById('cap-status');
  const progressBar = document.getElementById('cap-progress');

  // Show the saved cap value in the input field
  capInput.value = cap || '';

  // If no cap is set, clear the display
  if (!cap || cap === 0) {
    statusEl.textContent = '';
    statusEl.className = 'cap-status';
    progressBar.style.width = '0%';
    return;
  }

  const percentage = (spent / cap) * 100;
  const remaining = cap - spent;

  // Update the progress bar width (max 100% even if over budget)
  progressBar.style.width = Math.min(percentage, 100) + '%';

  // Show appropriate message based on how much was spent
  if (percentage >= 100) {
    // Over budget — urgent alert for screen readers
    statusEl.textContent = 'Budget exceeded by ' + symbol + Math.abs(remaining).toFixed(2) + '!';
    statusEl.className = 'cap-status error';
    progressBar.className = 'cap-progress-bar error';
    statusEl.setAttribute('aria-live', 'assertive');

  } else if (percentage >= 80) {
    // Getting close — polite warning
    statusEl.textContent = 'Warning: only ' + symbol + remaining.toFixed(2) + ' remaining (' + (100 - percentage).toFixed(1) + '% left)';
    statusEl.className = 'cap-status warning';
    progressBar.className = 'cap-progress-bar warning';
    statusEl.setAttribute('aria-live', 'polite');

  } else {
    // All good — show remaining budget
    statusEl.textContent = symbol + remaining.toFixed(2) + ' remaining (' + (100 - percentage).toFixed(1) + '% of budget)';
    statusEl.className = 'cap-status success';
    progressBar.className = 'cap-progress-bar';
    statusEl.setAttribute('aria-live', 'polite');
  }
}

// Show the list of categories in the Settings panel
function renderCategories() {
  const container = document.getElementById('categories-list');
  let html = '';

  for (let i = 0; i < state.state.categories.length; i++) {
    const cat = search.escapeHtml(state.state.categories[i]);
    html += `
      <div class="category-tag">
        <span>${cat}</span>
        <button data-remove-cat="${cat}" aria-label="Remove ${cat} category">×</button>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Update the category <select> dropdowns in the form and filter bar
function updateCategorySelects() {
  const formSelect = document.getElementById('category');
  const filterSelect = document.getElementById('category-filter');

  const previousFormValue = formSelect.value;
  const previousFilterValue = filterSelect.value;

  // Rebuild form category options
  let formOptions = '<option value="">Select a category</option>';
  for (let i = 0; i < state.state.categories.length; i++) {
    const cat = search.escapeHtml(state.state.categories[i]);
    formOptions += '<option value="' + cat + '">' + cat + '</option>';
  }
  formSelect.innerHTML = formOptions;

  // Rebuild filter category options
  let filterOptions = '<option value="">All Categories</option>';
  for (let i = 0; i < state.state.categories.length; i++) {
    const cat = search.escapeHtml(state.state.categories[i]);
    filterOptions += '<option value="' + cat + '">' + cat + '</option>';
  }
  filterSelect.innerHTML = filterOptions;

  // Restore the previously selected values
  formSelect.value = previousFormValue;
  filterSelect.value = previousFilterValue;
}

// Show the saved currency rates in the Settings form
function renderSettings() {
  const settings = state.state.settings;
  document.getElementById('base-currency').value = settings.baseCurrency;
  document.getElementById('usd-rate').value = settings.rates.USD;
  document.getElementById('eur-rate').value = settings.rates.EUR;
  document.getElementById('gbp-rate').value = settings.rates.GBP;
}

// Re-render everything (called after import/clear data)
export function renderAll() {
  renderRecords();
  renderDashboard();
  renderCategories();
  updateCategorySelects();
  renderSettings();
  renderBudgetCap();
  renderCategoryBreakdown();
  renderMonthlyTrend();
}

// ============================================================
// 9. EVENT DELEGATION — Records Buttons
// ============================================================

// Instead of attaching onclick to each button inside renderRecords(),
// we attach ONE listener to the container and check which button was clicked.
// This is more reliable with ES modules and re-rendered content.

function setupRecordsDelegation() {
  const container = document.getElementById('records-container');

  container.addEventListener('click', function (event) {
    // Find the closest button with a data-action attribute
    const button = event.target.closest('button[data-action]');
    if (!button) return; // Click was not on an action button

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
      openEditForm(id);
    } else if (action === 'delete') {
      handleDeleteClick(button, id);
    }
  });
}

// Open the Add Transaction form pre-filled with an existing transaction
function openEditForm(id) {
  const txn = state.getTransaction(id);
  if (!txn) return;

  // Fill the form with the transaction's current values
  document.getElementById('description').value = txn.description;
  document.getElementById('amount').value = txn.amount;
  document.getElementById('category').value = txn.category;
  document.getElementById('date').value = txn.date;

  // Change the submit button text to "Update"
  document.getElementById('submit-btn').textContent = 'Update Transaction';
  state.state.editingId = id;

  showSection('add');
}

// Two-click delete: first click asks for confirmation, second click deletes.
// This replaces the browser's confirm() dialog which is not accessible.
function handleDeleteClick(button, id) {
  if (button.dataset.confirming === 'true') {
    // SECOND CLICK — delete confirmed
    state.deleteTransaction(id);
    renderRecords();
    renderDashboard();
    renderCategoryBreakdown();
    renderMonthlyTrend();
    renderBudgetCap();

  } else {
    // FIRST CLICK — ask user to click again to confirm
    button.dataset.confirming = 'true';
    button.textContent = 'Confirm?';
    button.setAttribute('aria-label', 'Confirm delete — click again to permanently delete');

    // Auto-cancel after 3 seconds if no second click
    setTimeout(function () {
      if (button.dataset.confirming === 'true') {
        button.dataset.confirming = 'false';
        button.textContent = 'Delete';
        button.setAttribute('aria-label', 'Delete transaction');
      }
    }, 3000);
  }
}

// ============================================================
// 9b. EVENT DELEGATION — Category Remove Buttons
// ============================================================

function setupCategoriesDelegation() {
  const container = document.getElementById('categories-list');

  container.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-remove-cat]');
    if (!button) return;

    const categoryName = button.dataset.removeCat;
    state.removeCategory(categoryName);
    renderCategories();
    updateCategorySelects();
  });
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

// Show a small slide-in message at the bottom of the screen.
// This replaces the blocking browser alert() dialog.
function showToast(message, type) {
  type = type || 'success'; // Default to green/success style

  // Find or create the toast element
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.setAttribute('role', 'status');   // Announced by screen readers
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = 'app-toast app-toast--' + type + ' app-toast--visible';

  // Auto-hide after 3.5 seconds
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(function () {
    toast.className = 'app-toast app-toast--' + type;
  }, 3500);
}
