# Changelog

All notable changes to the see_pdfeditor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2025-11-01

### Fixed
- **CRITICAL: Page Drag State Bug**: Fixed issue where pages would jump back to wrong positions when dragged and reordered
  - Root cause: Wrapper function wasn't forwarding arguments, plus mouse/touch event conflicts
  - Fixed argument forwarding in `multi-pdf-app.js`
  - Added `mouseDragInProgress` flag to prevent event interference
  - Implemented proper scroll behavior with `scrollIntoView`
  - Reference: `docs/Error.mp4` (before), `docs/new-error.mp4` (after)

### Changed
- **UI Enhancements**: Improved icon alignment and button sizing
  - Fixed page action button (🔍 ↻ ×) alignment in `multi-pdf-styles.css`
  - Set consistent heights across all breakpoints (30px-44px)
  - Improved accessibility with 44px minimum touch targets on mobile

- **Scroll Performance**: Optimized scroll behavior for page navigation
  - Changed from `block: 'center'` to `block: 'nearest'` for faster scrolling
  - Implemented smooth scroll animation with proper timing
  - Better user experience when following moved pages

### Technical Details
**Files Modified:**
- `prototype/src/multi-pdf-ui.js` (lines 19, 412-460, 236-332)
- `prototype/multi-pdf-app.js` (lines 272-278)
- `prototype/multi-pdf-styles.css` (lines 381-549)

**Testing:**
- Cross-browser: Verified in Chrome, Firefox, Safari, Edge
- Mobile: Tested touch drag on iOS Safari and Android Chrome
- Large files: Tested with 150+ page PDFs

## [1.0.0] - 2025-10-30

### Added
- Initial MVP release
- PDF viewer with thumbnail panel
- Page drag-and-drop reorder
- Page rotation and deletion
- PDF export functionality
- Multi-document support
- Zoom preview modal
- Dark theme support
- Mobile touch drag for page reordering
- Keyboard shortcuts
- Accessibility features (WCAG AA)

### Technical Stack
- pdf.js for PDF rendering
- pdf-lib for PDF manipulation
- Vanilla JavaScript (no framework)
- Tailwind CSS for styling
- Service Worker for offline capabilities
