/*
  state.js
  --------
  This module manages the "state" — the current data of the app.
  State is just a fancy word for "what the app knows right now":
    - all transactions
    - the list of categories
    - currency settings
    - the budget cap
    - what filter/sort the user has chosen
    - whether we're editing an existing transaction

  All data changes go through this module, which also saves to localStorage
  via the storage.js module.
*/

import * as storage from './storage.js';

// ------------------------------------
// APP STATE (Global Data Object)
// ------------------------------------

// One central object that holds the current state of the whole app.
// We export it so ui.js can read it when rendering the screen.
export const state = {
  transactions: [],         // All transactions loaded from localStorage
  categories: [],         // All category names
  settings: {},         // Currency settings (base currency + rates)
  budgetCap: 0,          // Monthly spending limit (0 = no limit)

  // Current search/filter/sort choices from the Records page controls
  currentFilter: {
    searchRegex: null,        // The compiled regex from the search box
    category: '',          // The selected category filter ('' = all)
    sortBy: 'date-desc'  // Default: show newest transactions first
  },

  editingId: null  // The ID of a transaction being edited (null if adding new)
};

// ------------------------------------
// INITIALIZE STATE
// ------------------------------------

// Load all saved data from localStorage into the state object.
// Called once when the app starts.
export function initializeState() {
  state.transactions = storage.loadTransactions();
  state.categories = storage.loadCategories();
  state.settings = storage.loadSettings();
  state.budgetCap = storage.loadBudgetCap();
}

// ------------------------------------
// ID GENERATOR
// ------------------------------------

// Create a unique ID for each new transaction.
// Combines a timestamp and random characters so no two IDs are the same.
export function generateId() {
  const timestamp = Date.now().toString(36);              // e.g. "lf8tji"
  const random = Math.random().toString(36).slice(2, 9); // e.g. "k4z9xm2"
  return 'txn_' + timestamp + random;
}

// ------------------------------------
// TRANSACTIONS — ADD, UPDATE, DELETE
// ------------------------------------

// Add a new transaction to the list and save to localStorage.
export function addTransaction(formData) {
  const now = new Date().toISOString(); // e.g. "2025-09-29T10:30:00.000Z"

  const newTransaction = {
    id: generateId(),
    description: formData.description.trim(),
    amount: parseFloat(formData.amount),
    category: formData.category,
    date: formData.date,
    createdAt: now,
    updatedAt: now
  };

  // Add to beginning of list so newest appears first
  state.transactions.unshift(newTransaction);

  // Save the updated list to localStorage
  storage.saveTransactions(state.transactions);

  return newTransaction;
}

// Update an existing transaction by its ID.
export function updateTransaction(id, formData) {
  // Find the transaction in the array
  let foundIndex = -1;
  for (let i = 0; i < state.transactions.length; i++) {
    if (state.transactions[i].id === id) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) {
    return null; // Transaction not found
  }

  // Keep the original createdAt but update everything else
  const original = state.transactions[foundIndex];
  state.transactions[foundIndex] = {
    id: original.id,
    description: formData.description.trim(),
    amount: parseFloat(formData.amount),
    category: formData.category,
    date: formData.date,
    createdAt: original.createdAt,
    updatedAt: new Date().toISOString()
  };

  storage.saveTransactions(state.transactions);
  return state.transactions[foundIndex];
}

// Delete a transaction by its ID.
export function deleteTransaction(id) {
  let foundIndex = -1;
  for (let i = 0; i < state.transactions.length; i++) {
    if (state.transactions[i].id === id) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) {
    return false; // Not found
  }

  // Remove 1 item at foundIndex
  state.transactions.splice(foundIndex, 1);

  storage.saveTransactions(state.transactions);
  return true;
}

// Get a single transaction by ID (used by the edit form).
export function getTransaction(id) {
  for (let i = 0; i < state.transactions.length; i++) {
    if (state.transactions[i].id === id) {
      return state.transactions[i];
    }
  }
  return null; // Not found
}

// Get all transactions (used by dashboard charts).
export function getTransactions() {
  return state.transactions;
}

// ------------------------------------
// CATEGORIES — ADD, REMOVE
// ------------------------------------

// Add a new category if it doesn't already exist.
export function addCategory(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return false; // Empty string not allowed
  }

  if (state.categories.includes(trimmedName)) {
    return false; // Category already exists
  }

  state.categories.push(trimmedName);
  storage.saveCategories(state.categories);
  return true;
}

// Remove a category by name.
export function removeCategory(name) {
  const index = state.categories.indexOf(name);

  if (index === -1) {
    return false; // Not found
  }

  state.categories.splice(index, 1);
  storage.saveCategories(state.categories);
  return true;
}

// ------------------------------------
// BUDGET CAP
// ------------------------------------

// Set the monthly budget limit.
export function setBudgetCap(amount) {
  state.budgetCap = amount;
  storage.saveBudgetCap(amount);
}

// ------------------------------------
// SETTINGS
// ------------------------------------

// Update currency settings (base currency + exchange rates).
export function updateSettings(newSettings) {
  // Merge new settings into existing ones
  state.settings = Object.assign({}, state.settings, newSettings);
  storage.saveSettings(state.settings);
}

// ------------------------------------
// CLEAR ALL DATA
// ------------------------------------

// Wipe all transactions but keep categories and settings.
export function clearAllData() {
  state.transactions = [];
  state.categories = storage.loadCategories();
  state.settings = storage.loadSettings();
  state.budgetCap = 0;
  state.editingId = null;
  storage.clearAllData();
}

// ------------------------------------
// IMPORT / EXPORT
// ------------------------------------

// Re-load all state from localStorage after an import.
export function importData(data) {
  const result = storage.importData(data);
  if (result.success) {
    initializeState(); // Reload everything from storage
  }
  return result;
}

// Package all data for download as a JSON file.
export function exportData() {
  return storage.exportData();
}

// ------------------------------------
// STATISTICS (for the Dashboard)
// ------------------------------------

// Calculate summary numbers shown on the Dashboard section.
export function calculateStats() {
  const transactions = state.transactions;

  // Total number of transactions
  const total = transactions.length;

  // Add up all amounts to get total spending
  let totalExpenses = 0;
  for (let i = 0; i < transactions.length; i++) {
    totalExpenses += transactions[i].amount;
  }

  // Count spending per category to find the top category
  const categoryTotals = {};
  for (let i = 0; i < transactions.length; i++) {
    const cat = transactions[i].category;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] += transactions[i].amount;
  }

  // Find the category with the highest total
  let topCategory = 'None';
  let topAmount = 0;
  const categoryNames = Object.keys(categoryTotals);
  for (let i = 0; i < categoryNames.length; i++) {
    const cat = categoryNames[i];
    const amount = categoryTotals[cat];
    if (amount > topAmount) {
      topAmount = amount;
      topCategory = cat;
    }
  }

  // Calculate spending in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let weekTotal = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (new Date(transactions[i].date) >= sevenDaysAgo) {
      weekTotal += transactions[i].amount;
    }
  }

  // Build a daily totals object for the 7-day bar chart
  // We pre-fill each of the last 7 days with 0
  const dailyTotals = {};
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dateString = day.toISOString().split('T')[0]; // "2025-09-29"
    dailyTotals[dateString] = 0;
  }

  // Add each transaction's amount to its day in the chart
  for (let i = 0; i < transactions.length; i++) {
    const txnDate = transactions[i].date;
    if (dailyTotals.hasOwnProperty(txnDate)) {
      dailyTotals[txnDate] += transactions[i].amount;
    }
  }

  return {
    total: total,
    totalExpenses: totalExpenses,
    topCategory: topCategory,
    weekTotal: weekTotal,
    dailyTotals: dailyTotals,
    budgetCap: state.budgetCap
  };
}
