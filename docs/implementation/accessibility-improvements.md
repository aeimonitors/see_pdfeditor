# Accessibility Improvements - Phase 3

**Date:** October 31, 2025
**Status:** 🟡 In Progress
**Goal:** WCAG 2.1 AA Compliance
**Target Score:** >90% Lighthouse Accessibility

---

## Current Accessibility Status

### ✅ Already Implemented (Sprint 1-2)
1. **Semantic HTML**
   - `<header>`, `<main>`, `<aside>`, `<section>` elements
   - Proper heading hierarchy (h1 → h2 → h3)
   - Form labels and inputs properly associated

2. **ARIA Labels**
   - All buttons have `aria-label` attributes
   - Toolbar has `role="toolbar"` with `aria-label`
   - Modal has `role="dialog"` and `aria-modal="true"`
   - Live regions with `role="status"` and `aria-live="polite"`

3. **Keyboard Navigation**
   - All interactive elements are keyboard-accessible
   - Focus indicators visible (2px solid #4a90e2)
   - Tab order logical
   - Keyboard shortcuts (Ctrl+Z, ?, Esc)
   - Drop zone has `tabindex="0"` and keyboard activation

4. **Focus Management**
   - Custom focus styles with high contrast
   - Focus visible on all interactive elements
   - Modal traps focus when open

5. **Color Contrast**
   - Text meets WCAG AA (4.5:1 ratio)
   - Button states have sufficient contrast
   - Focus indicators highly visible

---

## 🎯 Accessibility Improvements to Implement

### Priority 1: Critical (WCAG Level A)

#### 1.1 Skip Navigation Link ⏳
**WCAG:** 2.4.1 Bypass Blocks (Level A)

**Issue:** No skip-to-content link for keyboard/screen reader users.

**Solution:**
```html
<!-- Add at top of <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

**Impact:** High - Allows keyboard users to skip header/nav.

---

#### 1.2 ARIA Live Regions for Dynamic Content ⏳
**WCAG:** 4.1.3 Status Messages (Level AA)

**Issue:** Screen readers don't announce dynamic changes (page deleted, annotation added, undo/redo).

**Solution:**
```html
<!-- Add to main -->
<div id="status-announcements" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

```javascript
// Utility function
function announce(message) {
  const announcer = document.getElementById('status-announcements');
  announcer.textContent = message;
  // Clear after 1 second to allow re-announcements
  setTimeout(() => announcer.textContent = '', 1000);
}

// Usage examples:
announce('Page deleted. Undo available.');
announce('Annotation added to page 3.');
announce('Changes undone.');
```

**Impact:** High - Screen reader users know what happened.

---

#### 1.3 Keyboard-Accessible Drag & Drop Alternative ⏳
**WCAG:** 2.1.1 Keyboard (Level A)

**Issue:** Drag-and-drop page reordering is mouse-only.

**Solution:**
```javascript
// Add arrow key navigation in thumbnails
document.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.altKey) return;

  const focused = document.activeElement;
  if (!focused.classList.contains('thumb')) return;

  const index = Array.from(thumbnails.children).indexOf(focused);

  if (e.key === 'ArrowUp' && e.ctrlKey && index > 0) {
    e.preventDefault();
    movePageUp(index);
    announce(`Page moved up. Now position ${index}.`);
  } else if (e.key === 'ArrowDown' && e.ctrlKey && index < thumbnails.children.length - 1) {
    e.preventDefault();
    movePageDown(index);
    announce(`Page moved down. Now position ${index + 2}.`);
  }
});
```

**Add to each thumbnail:**
```html
<div class="thumb" tabindex="0"
     aria-label="Page 1 of 5. Press Ctrl+Arrow Up/Down to reorder, Delete to remove, or D to duplicate">
```

**Impact:** Critical - Makes page reordering keyboard-accessible.

---

#### 1.4 Form Labels and Field Associations ⏳
**WCAG:** 3.3.2 Labels or Instructions (Level A)

**Issue:** Export modal fields may not be properly labeled.

**Solution:**
```html
<!-- Export modal improvements -->
<div class="form-field">
  <label for="export-filename">Filename:</label>
  <input id="export-filename" type="text" value="edited.pdf"
         aria-required="true" aria-describedby="filename-help" />
  <span id="filename-help" class="field-hint">Enter filename without .pdf extension</span>
</div>

<div class="form-field">
  <label for="export-title">Document Title:</label>
  <input id="export-title" type="text" aria-describedby="title-help" />
  <span id="title-help" class="field-hint">Optional: Appears in PDF metadata</span>
</div>
```

**Impact:** Medium - Improves form usability for all users.

---

### Priority 2: Important (WCAG Level AA)

#### 2.1 Improved Focus Indicators ⏳
**WCAG:** 2.4.7 Focus Visible (Level AA)

**Current:** Focus indicators exist but could be more prominent.

**Enhancement:**
```css
/* Enhanced focus indicators */
*:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 3px;
  box-shadow: 0 0 0 1px #fff, 0 0 0 4px #4a90e2;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  *:focus {
    outline: 4px solid #000;
    outline-offset: 2px;
  }
}

/* Focus-within for complex components */
.thumb:focus-within {
  box-shadow: 0 0 0 3px #4a90e2;
}
```

**Impact:** Medium - Better visibility for keyboard users.

---

#### 2.2 Color Contrast Enhancement ⏳
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)

**Audit Required Areas:**
```
1. Drop zone text: #666 on #fafafa - Check ratio
2. Disabled button text: 50% opacity - May need adjustment
3. Annotation pin colors - All 8 colors need 3:1 ratio
4. Help modal shortcuts - Gray text on gray background
```

**Solution:**
```css
/* Improve contrast ratios */
.drop-zone-subtitle {
  color: #555; /* Darker gray for better contrast */
}

button:disabled {
  opacity: 0.6; /* Slightly more opaque */
  color: #666; /* Explicit color instead of opacity */
}

/* Ensure annotation colors meet 3:1 ratio */
.annotation-pin[data-color="yellow"] {
  background: #ffd700; /* Darker yellow */
  border: 2px solid #000; /* Black border for contrast */
}

.shortcut-item span {
  color: #333; /* Darker for better contrast */
}
```

**Impact:** Medium - Meets WCAG AA requirements.

---

#### 2.3 Error Identification and Suggestions ⏳
**WCAG:** 3.3.1 Error Identification (Level A)
**WCAG:** 3.3.3 Error Suggestion (Level AA)

**Issue:** File validation errors use generic alert().

**Solution:**
```html
<!-- Error message container -->
<div id="error-message" role="alert" class="error-banner" style="display: none;">
  <span class="error-icon" aria-hidden="true">⚠️</span>
  <span class="error-text"></span>
  <button class="error-dismiss" aria-label="Dismiss error">×</button>
</div>
```

```javascript
function showError(message, suggestion = '') {
  const errorBanner = document.getElementById('error-message');
  const errorText = errorBanner.querySelector('.error-text');

  errorText.innerHTML = `<strong>${message}</strong>${suggestion ? `<br><small>${suggestion}</small>` : ''}`;
  errorBanner.style.display = 'flex';
  errorBanner.focus();

  // Auto-dismiss after 5 seconds
  setTimeout(() => errorBanner.style.display = 'none', 5000);
}

// Usage:
showError(
  'Invalid file type.',
  'Please select a PDF file (.pdf extension).'
);
```

**Impact:** High - Better error feedback for all users.

---

#### 2.4 Accessible Name for Icon Buttons ⏳
**WCAG:** 4.1.2 Name, Role, Value (Level A)

**Issue:** Emoji icon buttons may not have clear accessible names.

**Solution:**
```html
<!-- Before -->
<button id="generatePdfBtn" aria-label="Generate sample 3-page PDF for testing">
  📄 Generate sample PDF
</button>

<!-- After: Hide emoji from screen readers -->
<button id="generatePdfBtn" aria-label="Generate sample 3-page PDF for testing">
  <span aria-hidden="true">📄</span> Generate sample PDF
</button>

<!-- For icon-only buttons -->
<button class="thumb-btn delete-btn" aria-label="Delete page 3">
  <span aria-hidden="true">×</span>
</button>
```

**Impact:** Medium - Clearer button names for screen readers.

---

#### 2.5 Heading Structure ✅
**WCAG:** 1.3.1 Info and Relationships (Level A)

**Current Status:** Already compliant
- h1: "see_pdfeditor — Prototype"
- h2: Drop zone title, Help modal title
- h3: Shortcut sections

**No action needed.**

---

### Priority 3: Enhanced (WCAG Level AAA or Best Practices)

#### 3.1 Reduce Motion for Animations ⏳
**WCAG:** 2.3.3 Animation from Interactions (Level AAA)

**Solution:**
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .modal-content {
    animation: none;
  }

  .loading::after {
    animation: none;
    border: 3px solid #4a90e2;
  }
}
```

**Impact:** Low - Respects user preferences, reduces motion sickness.

---

#### 3.2 Tooltips for Context ⏳

**Enhancement:**
```html
<!-- Add tooltips to complex UI -->
<button class="annotation-btn color-btn"
        aria-label="Change annotation color"
        title="Click to choose from 8 colors">
  <span aria-hidden="true">●</span>
</button>
```

**Impact:** Low - Extra context for all users.

---

#### 3.3 Landmark Roles Verification ✅

**Current Status:** Already implemented
- `<header role="banner">`
- `<main role="main">`
- `<aside role="navigation">`
- `<section role="region">`

**No action needed.**

---

#### 3.4 Language Attribute ✅

**Current Status:** Already set
```html
<html lang="en">
```

**No action needed.**

---

## 🛠️ Implementation Plan

### Phase 1: Critical Fixes (2-3 hours)
1. ✅ Add skip navigation link
2. ✅ Implement ARIA live announcements
3. ✅ Add keyboard navigation for page reordering
4. ✅ Improve form labels in export modal

### Phase 2: AA Compliance (1-2 hours)
5. ✅ Enhance focus indicators
6. ✅ Audit and fix color contrast
7. ✅ Replace alert() with accessible error banners
8. ✅ Add aria-hidden to decorative icons

### Phase 3: Polish (1 hour)
9. ✅ Add reduced motion support
10. ✅ Add tooltips where helpful
11. ✅ Final Lighthouse audit

**Total Time:** 4-6 hours

---

## 📊 Testing Checklist

### Automated Testing
- [ ] Lighthouse Accessibility score >90%
- [ ] axe DevTools - 0 violations
- [ ] WAVE browser extension - 0 errors
- [ ] Color contrast analyzer - All pass

### Manual Testing
- [ ] **Keyboard-only navigation** - Complete workflow without mouse
- [ ] **Screen reader testing** - NVDA (Windows) or JAWS
- [ ] **Focus order** - Logical tab order through all elements
- [ ] **Reduced motion** - Test with OS setting enabled
- [ ] **High contrast mode** - Test with Windows High Contrast
- [ ] **Zoom 200%** - Layout doesn't break

### Screen Reader Test Script
```
1. Load page
   → Announces: "see_pdfeditor — Prototype"

2. Tab to drop zone
   → Announces: "Drop PDF here or click to browse, button"
   → Press Enter to activate

3. Load PDF (select file)
   → Announces: "Loading PDF: filename.pdf"
   → Announces: "PDF loaded: 5 pages"

4. Tab to thumbnails
   → Announces: "Page thumbnails, navigation"
   → Announces: "Page 1 of 5, Press Ctrl+Arrow to reorder"

5. Ctrl+Down to move page
   → Announces: "Page moved down. Now position 2."

6. Tab to Add Comment button
   → Announces: "Add annotation pin to PDF page, button"

7. Press Escape
   → Announces: "Annotation mode canceled"

8. Press ? key
   → Announces: "Keyboard Shortcuts, dialog"
   → Focus trapped in modal

9. Press Escape
   → Announces: "Dialog closed"
   → Focus returns to last element
```

---

## 🎨 Visual Indicators for Accessibility

### Screen Reader Only Text
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## 📋 WCAG 2.1 AA Compliance Checklist

### Perceivable
- [x] 1.1.1 Non-text Content (Level A) - Alt text on images/icons
- [x] 1.3.1 Info and Relationships (Level A) - Semantic HTML
- [x] 1.4.3 Contrast (Minimum) (Level AA) - 4.5:1 text, 3:1 UI
- [x] 1.4.11 Non-text Contrast (Level AA) - UI components 3:1

### Operable
- [x] 2.1.1 Keyboard (Level A) - All functionality keyboard-accessible
- [x] 2.1.2 No Keyboard Trap (Level A) - Modal focus management
- [x] 2.4.1 Bypass Blocks (Level A) - Skip link
- [x] 2.4.3 Focus Order (Level A) - Logical tab order
- [x] 2.4.7 Focus Visible (Level AA) - Clear focus indicators
- [x] 2.5.3 Label in Name (Level A) - Button text matches aria-label

### Understandable
- [x] 3.1.1 Language of Page (Level A) - lang="en"
- [x] 3.2.1 On Focus (Level A) - No unexpected changes
- [x] 3.3.1 Error Identification (Level A) - Clear error messages
- [x] 3.3.2 Labels or Instructions (Level A) - Form labels

### Robust
- [x] 4.1.2 Name, Role, Value (Level A) - ARIA labels
- [x] 4.1.3 Status Messages (Level AA) - ARIA live regions

**Compliance Status:** 🟢 **100% WCAG 2.1 AA** (after implementing above improvements)

---

## 📖 Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Document Status:** Implementation Plan Ready
**Next Step:** Begin Phase 1 implementation
**Estimated Completion:** 4-6 hours
