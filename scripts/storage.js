/*
  storage.js
  ----------
  This module handles saving and loading data from localStorage.
  localStorage is the browser's built-in storage that keeps data
  even after the page is refreshed.

  We store four things:
    - transactions: the list of all spending records
    - settings: currency settings (USD, EUR, GBP)
    - categories: the list of spending categories
    - budgetCap: the monthly budget limit the user sets
*/

// Keys used to identify data in localStorage
const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-tracker:transactions',
  SETTINGS: 'finance-tracker:settings',
  CATEGORIES: 'finance-tracker:categories',
  BUDGET_CAP: 'finance-tracker:budget-cap'
};

// Default categories shown when the app first loads
const DEFAULT_CATEGORIES = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

// Default currency settings (base USD, with rates for EUR and GBP)
const DEFAULT_SETTINGS = {
  baseCurrency: 'USD',
  rates: {
    USD: 1.00,
    EUR: 0.92,
    GBP: 0.79
  }
};

// ------------------------------------
// TRANSACTIONS
// ------------------------------------

// Load all transactions from localStorage.
// If nothing is saved yet, return an empty array.
export function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      return JSON.parse(saved); // Convert JSON string back to array
    }
    return []; // No data saved yet
  } catch (error) {
    console.error('Could not load transactions:', error);
    return [];
  }
}

// Save all transactions to localStorage.
// We convert the array to a JSON string because localStorage only stores strings.
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Could not save transactions:', error);
    return false;
  }
}

// ------------------------------------
// SETTINGS
// ------------------------------------

// Load currency settings. Returns default settings if nothing is saved.
export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Could not load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save currency settings to localStorage.
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Could not save settings:', error);
    return false;
  }
}

// ------------------------------------
// CATEGORIES
// ------------------------------------

// Load the list of categories. Returns defaults if nothing is saved.
export function loadCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Could not load categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

// Save the categories list to localStorage.
export function saveCategories(categories) {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Could not save categories:', error);
    return false;
  }
}

// ------------------------------------
// BUDGET CAP
// ------------------------------------

// Load the budget cap (monthly spending limit).
// Returns 0 if no cap has been set.
export function loadBudgetCap() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET_CAP);
    if (saved) {
      return parseFloat(saved); // Convert string back to a number
    }
    return 0;
  } catch (error) {
    console.error('Could not load budget cap:', error);
    return 0;
  }
}

// Save the budget cap as a string (localStorage only stores strings).
export function saveBudgetCap(cap) {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET_CAP, String(cap));
    return true;
  } catch (error) {
    console.error('Could not save budget cap:', error);
    return false;
  }
}

// ------------------------------------
// CLEAR, EXPORT, IMPORT
// ------------------------------------

// Delete all saved data from localStorage.
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGET_CAP);
    return true;
  } catch (error) {
    console.error('Could not clear data:', error);
    return false;
  }
}

// Bundle all data into one object for downloading as a JSON file.
export function exportData() {
  return {
    transactions: loadTransactions(),
    settings: loadSettings(),
    categories: loadCategories(),
    budgetCap: loadBudgetCap(),
    exportDate: new Date().toISOString()
  };
}

// Load data from an imported JSON file and save each part.
export function importData(data) {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    // Only import each field if it exists in the file
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings(data.settings);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveCategories(data.categories);
    }
    if (typeof data.budgetCap === 'number') {
      saveBudgetCap(data.budgetCap);
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, message: error.message };
  }
}
