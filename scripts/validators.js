/*
  validators.js
  -------------
  This module checks that user input is valid before we save it.
  We use Regular Expressions (regex) to check each field.

  A regex is a pattern that describes what text should look like.
  For example: /^\d{4}$/ means "exactly 4 digits".

  We have 5 rules:
    1. Description — no leading/trailing spaces
    2. Amount      — a valid positive number (e.g. 10 or 10.50)
    3. Date        — YYYY-MM-DD format
    4. Category    — only letters, spaces, hyphens
    5. Duplicate words — advanced: catches "the the" style mistakes
*/

// ------------------------------------
// REGEX PATTERNS
// ------------------------------------
// These patterns are exported so tests.html can display them.

export const REGEX_PATTERNS = {
  // Must start and end with a non-space character
  // ^\S = first char is not whitespace
  // (?:.*\S)? = optionally followed by anything ending in non-whitespace
  description: /^\S(?:.*\S)?$/,

  // A number like 0, 10, 10.5, or 10.50 — up to 2 decimal places
  // ^(0|[1-9]\d*) = either "0" or a number starting with 1-9
  // (\.\d{1,2})?$ = optionally followed by a dot and 1-2 digits
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  // Date in YYYY-MM-DD format
  // \d{4} = 4 digit year
  // (0[1-9]|1[0-2]) = month 01-12
  // (0[1-9]|[12]\d|3[01]) = day 01-31
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // Only letters, with spaces or hyphens between words
  // e.g. "Food", "Fast Food", "Auto-Transport"
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

  // Advanced: back-reference to catch duplicate consecutive words
  // \b(\w+)\s+\1\b  — captures a word, then matches the SAME word again
  // Example match: "the the book" or "coffee coffee"
  duplicateWord: /\b(\w+)\s+\1\b/i
};

// ------------------------------------
// ERROR MESSAGES
// ------------------------------------

const MESSAGES = {
  description: {
    required: 'Description is required',
    invalid: 'Description cannot start or end with a space',
    duplicate: 'Description has a repeated word (e.g. "the the")'
  },
  amount: {
    required: 'Amount is required',
    invalid: 'Enter a valid amount like 10 or 10.50'
  },
  date: {
    required: 'Date is required',
    invalid: 'Date must be in YYYY-MM-DD format (e.g. 2025-09-29)'
  },
  category: {
    required: 'Please select a category',
    invalid: 'Category can only contain letters, spaces, and hyphens'
  }
};

// ------------------------------------
// INDIVIDUAL FIELD VALIDATORS
// ------------------------------------

// Check the description field.
// Returns { valid: true } or { valid: false, message: '...' }
export function validateDescription(value) {
  // Check if empty
  if (!value || value.trim() === '') {
    return { valid: false, message: MESSAGES.description.required };
  }

  // Check for leading or trailing spaces
  if (!REGEX_PATTERNS.description.test(value)) {
    return { valid: false, message: MESSAGES.description.invalid };
  }

  // Advanced check: look for duplicate consecutive words like "the the"
  if (REGEX_PATTERNS.duplicateWord.test(value)) {
    return { valid: false, message: MESSAGES.description.duplicate };
  }

  return { valid: true, message: '' };
}

// Check the amount field.
export function validateAmount(value) {
  if (!value || value.trim() === '') {
    return { valid: false, message: MESSAGES.amount.required };
  }

  if (!REGEX_PATTERNS.amount.test(value)) {
    return { valid: false, message: MESSAGES.amount.invalid };
  }

  // Make sure it's not negative (regex allows 0, which is fine)
  const number = parseFloat(value);
  if (number < 0) {
    return { valid: false, message: 'Amount cannot be negative' };
  }

  return { valid: true, message: '' };
}

// Check the date field.
export function validateDate(value) {
  if (!value || value.trim() === '') {
    return { valid: false, message: MESSAGES.date.required };
  }

  // First, check the format with regex
  if (!REGEX_PATTERNS.date.test(value)) {
    return { valid: false, message: MESSAGES.date.invalid };
  }

  // Second, check the date is actually real (e.g. Feb 30 doesn't exist)
  const parts = value.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const dateObject = new Date(year, month - 1, day);

  const isRealDate = (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );

  if (!isRealDate) {
    return { valid: false, message: 'That date does not exist (e.g. Feb 30 is invalid)' };
  }

  return { valid: true, message: '' };
}

// Check the category field.
export function validateCategory(value) {
  if (!value || value.trim() === '') {
    return { valid: false, message: MESSAGES.category.required };
  }

  if (!REGEX_PATTERNS.category.test(value)) {
    return { valid: false, message: MESSAGES.category.invalid };
  }

  return { valid: true, message: '' };
}

// ------------------------------------
// FULL FORM VALIDATOR
// ------------------------------------

// Validate all fields of a transaction at once.
// Returns { valid: true } or { valid: false, errors: { fieldName: 'message' } }
export function validateTransaction(transaction) {
  const errors = {};

  // Check each field and collect any error messages
  const descCheck = validateDescription(transaction.description);
  const amountCheck = validateAmount(String(transaction.amount || ''));
  const dateCheck = validateDate(transaction.date);
  const categoryCheck = validateCategory(transaction.category);

  if (!descCheck.valid) errors.description = descCheck.message;
  if (!amountCheck.valid) errors.amount = amountCheck.message;
  if (!dateCheck.valid) errors.date = dateCheck.message;
  if (!categoryCheck.valid) errors.category = categoryCheck.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

// ------------------------------------
// IMPORT FILE VALIDATOR
// ------------------------------------

// Check that data imported from a JSON file has the correct structure.
export function validateImportData(data) {
  try {
    // Must be an object
    if (!data || typeof data !== 'object') {
      return { valid: false, message: 'File does not contain valid JSON data' };
    }

    // Must have a transactions array
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return { valid: false, message: 'Missing transactions list in file' };
    }

    // Check each transaction has the required fields
    for (let i = 0; i < data.transactions.length; i++) {
      const txn = data.transactions[i];
      const num = i + 1; // Human-readable position (starts at 1)

      if (!txn.id || typeof txn.id !== 'string') {
        return { valid: false, message: 'Transaction ' + num + ': missing or invalid id' };
      }
      if (!txn.description || typeof txn.description !== 'string') {
        return { valid: false, message: 'Transaction ' + num + ': missing description' };
      }
      if (typeof txn.amount !== 'number' || txn.amount < 0) {
        return { valid: false, message: 'Transaction ' + num + ': invalid amount' };
      }
      if (!txn.category || typeof txn.category !== 'string') {
        return { valid: false, message: 'Transaction ' + num + ': missing category' };
      }
      if (!txn.date || !REGEX_PATTERNS.date.test(txn.date)) {
        return { valid: false, message: 'Transaction ' + num + ': invalid date format' };
      }
      if (!txn.createdAt || !txn.updatedAt) {
        return { valid: false, message: 'Transaction ' + num + ': missing timestamps' };
      }
    }

    return { valid: true, message: 'Data looks good!' };
  } catch (error) {
    return { valid: false, message: 'Validation error: ' + error.message };
  }
}
