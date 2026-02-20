/*
  search.js
  ---------
  This module handles three things:
    1. compileRegex  — safely turns a user's text into a search pattern
    2. highlight     — wraps matching text in <mark> tags so it's highlighted
    3. searchTransactions — filters the list to only matching records
    4. filterByCategory  — filters by the chosen category
    5. sortTransactions  — sorts the list by date, amount, or description
*/

// ------------------------------------
// COMPILE REGEX (Safe Version)
// ------------------------------------

// Turn the user's search text into a regular expression.
// We wrap it in try/catch because an invalid pattern (like "++")
// would crash with an error — this way we just return null instead.
//
// caseSensitive: if true, "Coffee" won't match "coffee"
export function compileRegex(input, caseSensitive) {
  // If search box is empty, there's nothing to search for
  if (!input || input.trim() === '') {
    return null;
  }

  try {
    // 'i' flag = case-insensitive (default)
    // No 'g' (global) flag — avoids a regex bug where .test() gives wrong results
    //   when called multiple times on the same regex object
    const flags = caseSensitive ? '' : 'i';
    return new RegExp(input, flags);
  } catch (error) {
    // If the pattern is invalid, silently return null
    console.error('Invalid regex pattern:', error.message);
    return null;
  }
}

// Build a global version of a regex for use in text replacement.
// We need 'g' (global) flag in highlight() so it replaces ALL matches,
// not just the first one. We create a fresh regex here to avoid
// polluting the original regex's lastIndex state.
function makeGlobalRegex(regex) {
  if (!regex) return null;
  try {
    const flags = regex.flags.includes('i') ? 'gi' : 'g';
    return new RegExp(regex.source, flags);
  } catch (error) {
    return null;
  }
}

// ------------------------------------
// HIGHLIGHT MATCHES
// ------------------------------------

// Wrap every match of the regex in the text with a <mark> tag.
// This makes matching words appear highlighted on screen.
//
// For security, we escape the text first so any HTML characters like
// < or > in a transaction description don't break the page layout.
export function highlight(text, regex) {
  // Nothing to highlight if no regex or no text
  if (!regex || !text) {
    return escapeHtml(text || '');
  }

  try {
    // Use a GLOBAL regex so every match gets highlighted (not just the first)
    const globalRegex = makeGlobalRegex(regex);
    const safeText = escapeHtml(text);
    const highlighted = safeText.replace(globalRegex, function (match) {
      return '<mark>' + match + '</mark>';
    });
    return highlighted;
  } catch (error) {
    console.error('Error while highlighting text:', error.message);
    return escapeHtml(text);
  }
}

// ------------------------------------
// ESCAPE HTML (Security Helper)
// ------------------------------------

// Convert special HTML characters so they display safely as text.
// e.g. "<script>" becomes "&lt;script&gt;" which shows as text, not code.
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text; // The browser does the escaping for us
  return div.innerHTML;
}

// ------------------------------------
// FILTER TRANSACTIONS
// ------------------------------------

// Filter transactions to only those that match the search pattern.
// We check description, amount, category, and date.
export function searchTransactions(transactions, searchRegex) {
  // If no search pattern, return the full list
  if (!searchRegex) {
    return transactions;
  }

  const results = [];

  for (let i = 0; i < transactions.length; i++) {
    const txn = transactions[i];

    // Check if the pattern matches any of the transaction fields
    const matchesDescription = searchRegex.test(txn.description);
    const matchesAmount = searchRegex.test(String(txn.amount));
    const matchesCategory = searchRegex.test(txn.category);
    const matchesDate = searchRegex.test(txn.date);

    if (matchesDescription || matchesAmount || matchesCategory || matchesDate) {
      results.push(txn);
    }
  }

  return results;
}

// Filter transactions to only those in a specific category.
export function filterByCategory(transactions, category) {
  // Empty string means "All Categories" — no filtering
  if (!category) {
    return transactions;
  }

  const results = [];
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].category === category) {
      results.push(transactions[i]);
    }
  }
  return results;
}

// ------------------------------------
// SORT TRANSACTIONS
// ------------------------------------

// Sort the list of transactions based on the chosen option.
// We use [...transactions] to make a copy so we don't change the original.
export function sortTransactions(transactions, sortBy) {
  const sorted = [...transactions]; // Copy the array

  if (sortBy === 'date-desc') {
    // Newest first
    sorted.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

  } else if (sortBy === 'date-asc') {
    // Oldest first
    sorted.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

  } else if (sortBy === 'desc-asc') {
    // Description A → Z
    sorted.sort(function (a, b) {
      return a.description.localeCompare(b.description);
    });

  } else if (sortBy === 'desc-desc') {
    // Description Z → A
    sorted.sort(function (a, b) {
      return b.description.localeCompare(a.description);
    });

  } else if (sortBy === 'amount-desc') {
    // Highest amount first
    sorted.sort(function (a, b) {
      return b.amount - a.amount;
    });

  } else if (sortBy === 'amount-asc') {
    // Lowest amount first
    sorted.sort(function (a, b) {
      return a.amount - b.amount;
    });
  }

  return sorted;
}
