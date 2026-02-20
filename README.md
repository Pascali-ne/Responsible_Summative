# Student Finance Tracker

A comprehensive, accessible web application for managing student finances with advanced regex search, budget tracking, and multi-currency support.

## Live Demo

**GitHub Pages:**(https://pascali-ne.github.io/Responsible_Summative/)

## Features

### Core Functionality
- **Transaction Management**: Add, edit, and delete financial transactions with detailed categorization
- **Budget Cap Tracking**: Set monthly budget limits with visual progress indicators and ARIA live alerts
- **Advanced Search**: Regex-powered search with pattern matching and highlighting
- **Data Persistence**: Automatic localStorage saving with JSON import/export capabilities
- **Multi-Currency Support**: Manual conversion rates for USD, EUR, and GBP
- **Custom Categories**: Create and manage your own transaction categories
- **Smart Filtering**: Filter by category and sort by date, amount, or description
- **Dashboard Analytics**: View spending trends, top categories, and last 7 days activity

### Accessibility Features
- Semantic HTML5 structure with proper landmarks
- Full keyboard navigation support
- ARIA live regions for dynamic updates
- Skip-to-content link
- Visible focus indicators
- Screen reader friendly
- WCAG 2.1 AA compliant color contrast

### Responsive Design
- Mobile-first approach
- Three breakpoints: 360px (mobile), 768px (tablet), 1024px (desktop)
- Flexible layouts using CSS Grid and Flexbox
- Touch-friendly buttons and controls

## Technology Stack

- **HTML5**: Semantic markup with proper accessibility attributes
- **CSS3**: Custom properties, Flexbox, Grid, animations
- **JavaScript (ES6+)**: Modular architecture with ES modules
- **localStorage**: Client-side data persistence
- No frameworks or external libraries

## Project Structure

```
student-finance-tracker/
├── index.html              # Main application page
├── tests.html              # Regex validation tests
├── seed.json               # Sample data for testing
├── README.md               # This file
├── styles/
│   └── main.css           # Complete application styles
└── scripts/
    ├── app.js             # Application initialization
    ├── state.js           # State management and business logic
    ├── storage.js         # localStorage wrapper
    ├── validators.js      # Regex validation rules
    ├── search.js          # Search and filtering logic
    └── ui.js              # DOM manipulation and rendering
```

## Regex Patterns Catalog

### 1. Description Validation
**Pattern**: `/^\S(?:.*\S)?$/`

**Purpose**: Ensures descriptions have no leading/trailing whitespace and aren't empty

**Examples**:
- VALID: `"Lunch at cafeteria"`, `"Coffee with friends"`
- INVALID: `" Leading space"`, `"Trailing space "`, `"   "`

### 2. Amount Validation
**Pattern**: `/^(0|[1-9]\d*)(\.\d{1,2})?$/`

**Purpose**: Validates monetary amounts with optional 1-2 decimal places

**Examples**:
- VALID: `"10"`, `"10.5"`, `"10.50"`, `"999.99"`
- INVALID: `"10."`, `".50"`, `"10.505"`, `"abc"`

### 3. Date Validation (YYYY-MM-DD)
**Pattern**: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`

**Purpose**: Validates dates in ISO 8601 format with additional date logic checks

**Examples**:
- VALID: `"2025-09-29"`, `"2024-02-29"` (leap year)
- INVALID: `"2025-13-01"`, `"2025-02-29"`, `"25-09-29"`

### 4. Category Validation
**Pattern**: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`

**Purpose**: Allows letters, spaces, and hyphens for category names

**Examples**:
- VALID: `"Food"`, `"Fast Food"`, `"Auto-Transport"`
- INVALID: `"Food123"`, `"Food-"`, `"Food & Drinks"`

### 5. Duplicate Word Detection (Advanced)
**Pattern**: `/\b(\w+)\s+\1\b/i`

**Purpose**: Uses back-reference to detect consecutive duplicate words

**Technique**: Back-reference `\1` matches the same word captured in group `(\w+)`

**Examples**:
- MATCHES: `"the the book"`, `"coffee coffee"`, `"buy buy now"`
- NO MATCH: `"the theme"`, `"book looking"`, `"normal text"`

### Search Pattern Examples

Users can enter custom regex patterns in the search box:

- **Find amounts with cents**: `/\.\d{2}\b/`
- **Find beverage keywords**: `/(coffee|tea)/i`
- **Find specific dates**: `/2025-02-\d{2}/`
- **Case-sensitive search**: Enable "Case sensitive" checkbox

## Keyboard Navigation Map

### Global Navigation
- `Tab` / `Shift+Tab` - Navigate through interactive elements
- `Enter` / `Space` - Activate buttons and links
- `Escape` - Cancel forms or close modals

### Navigation Menu
- `Tab` - Move between menu items
- `Enter` - Navigate to selected section

### Forms
- `Tab` - Move between form fields
- `Shift+Tab` - Move backwards
- `Enter` - Submit form (when on submit button)
- `Space` - Toggle checkboxes

### Records List
- `Tab` - Navigate to edit/delete buttons
- `Enter` - Activate selected button

### Select Dropdowns
- `Space` / `Enter` - Open dropdown
- `Arrow Up/Down` - Navigate options
- `Enter` - Select option

## Accessibility Notes

### ARIA Implementation
- **Live Regions**: Budget cap status uses `aria-live="polite"` (normal updates) and `aria-live="assertive"` (urgent alerts when budget exceeded)
- **Labels**: All form inputs have associated `<label>` elements with `for` attributes
- **Descriptions**: Error messages use `aria-describedby` to link to inputs
- **Roles**: Status messages use `role="status"` for screen reader announcements
- **Navigation**: Main navigation uses `aria-label="Main navigation"`

### Semantic Structure
```html
<header> - Site header with navigation
  <nav aria-label="Main navigation">
<main id="main-content"> - Main content area
  <section aria-labelledby="section-heading">
<footer> - Site footer
```

### Focus Management
- Skip-to-content link appears on first `Tab` press
- Visible focus indicators (2px blue outline with offset)
- Logical tab order maintained
- No keyboard traps

### Color Contrast
All color combinations meet WCAG 2.1 AA standards:
- Text on background: 7:1 ratio
- Interactive elements: 4.5:1 ratio minimum
- Visual feedback for all states (hover, focus, active)

### Screen Reader Testing
Tested with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

## Installation & Setup

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pascali-ne/Responsible_Summative.git
   cd Responsible_Summative
   ```

2. **Open in browser**:
   - Simply open `index.html` in a modern web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js http-server
     npx http-server
     ```

3. **View tests**:
   - Open `tests.html` in your browser
   - Tests will run automatically

### Loading Sample Data

1. Go to Settings section
2. Click "Import Data (JSON)"
3. Select the `seed.json` file
4. Data will be validated and loaded automatically

### Deployment to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to Pages section
   - Select "main" branch
   - Save and wait for deployment

3. **Access your site**:
   - URL will be: `https://pascali-ne.github.io/Responsible_Summative/`
## Running Tests

### Automated Validation Tests

1. Open `tests.html` in your browser
2. Tests run automatically on load
3. Click "Run All Tests" to re-run

**Test Coverage**:
- 40+ test cases across 5 validation suites
- Tests all regex patterns with edge cases
- Includes advanced pattern testing (duplicate word detection)

### Manual Testing Checklist

**Functionality**:
- [ ] Add transaction with valid data
- [ ] Edit existing transaction
- [ ] Delete transaction with confirmation
- [ ] Set budget cap and observe alerts
- [ ] Search with regex patterns
- [ ] Sort by different criteria
- [ ] Filter by category
- [ ] Export data to JSON
- [ ] Import previously exported data
- [ ] Add custom category
- [ ] Remove category

**Accessibility**:
- [ ] Navigate entire app using only keyboard
- [ ] Verify skip-to-content link works
- [ ] Check focus indicators on all interactive elements
- [ ] Test with screen reader
- [ ] Verify ARIA live regions announce updates
- [ ] Check color contrast in browser dev tools

**Responsiveness**:
- [ ] Test on mobile (360px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify touch targets are adequate (44x44px minimum)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

- Data stored in localStorage (limited to ~5-10MB)
- No server-side synchronization
- Currency conversion rates are manual (no live API)
- Date picker uses text input (YYYY-MM-DD format required)

## Future Enhancements

- Service worker for offline support
- CSV export functionality
- Multiple budget caps (daily, weekly, monthly)
- Receipt photo attachments
- Recurring transaction templates
- Data visualization improvements

## Development Notes

### Code Quality Standards
- ES6+ JavaScript with modules
- Consistent 2-space indentation
- Descriptive variable and function names
- Separated concerns (state, UI, storage, validation)
- Error handling on all async operations
- Input sanitization and validation

### Performance Considerations
- Efficient DOM updates (batch rendering)
- Debounced search input
- CSS animations use `transform` and `opacity`
- Minimal layout thrashing
- localStorage operations optimized

## Contributing

This is a student project for educational purposes. Individual work only.

## License

MIT License - Educational use only

## Contact

- **GitHub**: [@pascaline](https://github.com/Pascali-ne)
- **Email**: p.mukamugis@alustudent.com

## Acknowledgments

Built as a summative assignment for demonstrating:
- Semantic HTML and accessibility
- Responsive CSS design
- JavaScript DOM manipulation
- Regex validation and search
- Data persistence
- Modular code architecture

---

**Last Updated**: February 2025
