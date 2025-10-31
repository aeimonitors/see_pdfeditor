# Mobile Device Testing Checklist

**Application:** see_pdfeditor
**Testing Date:** [To be completed]
**Tester:** [Your name]
**Version:** MVP 1.0

---

## Testing Overview

This checklist ensures see_pdfeditor works correctly on mobile devices (smartphones and tablets). Complete separately for each device.

### Devices to Test

| Device | OS | Browser | Status | Notes |
|--------|----|---------| -------|-------|
| **iPhone** | iOS 14+ | Safari | ⏳ Pending | |
| **Android Phone** | Android 10+ | Chrome | ⏳ Pending | |
| **iPad** | iOS 14+ | Safari | ⏳ Pending | Optional |
| **Android Tablet** | Android 10+ | Chrome | ⏳ Pending | Optional |

---

## Device Information

**Device Model:** _________________
**OS Version:** _________________
**Browser:** _________________
**Browser Version:** _________________
**Screen Size:** _________ x _________ px
**Orientation:** ☐ Portrait  ☐ Landscape
**Test Date:** _________________

---

## 1. Initial Load & Layout

### 1.1 Page Loading
- [ ] Page loads within 5 seconds on 4G/5G
- [ ] Page loads within 10 seconds on 3G
- [ ] No visible layout shifts
- [ ] All UI elements visible
- [ ] No horizontal scroll required
- [ ] Vendor assets load message appears

**Load Time:** ________ seconds
**Network Type:** ________ (4G/5G/WiFi)

**Issues Found:**
```
[Describe any issues]
```

### 1.2 Responsive Layout - Portrait
- [ ] Header displays correctly
- [ ] Drop zone visible and styled
- [ ] Controls visible (may wrap)
- [ ] All buttons accessible
- [ ] Thumbnails display horizontally at top
- [ ] Viewer below thumbnails
- [ ] Help modal fits screen
- [ ] No elements cut off

**Screen Width:** ________ px
**Layout Breakpoint:** ________ px

**Issues Found:**
```
[Describe any issues]
```

### 1.3 Responsive Layout - Landscape
- [ ] Layout adapts correctly
- [ ] Thumbnails on left side (or horizontal top)
- [ ] Viewer uses remaining space
- [ ] All buttons accessible
- [ ] No awkward spacing
- [ ] No horizontal scroll

**Issues Found:**
```
[Describe any issues]
```

### 1.4 Text Readability
- [ ] All text readable without zoom
- [ ] Font sizes appropriate for mobile
- [ ] Button labels clear
- [ ] Instructions readable
- [ ] Help modal text readable
- [ ] Annotation text readable

**Issues Found:**
```
[Describe any issues]
```

---

## 2. Touch Interface Tests

### 2.1 Button Touch Targets
- [ ] All buttons minimum 44x44px (Apple guideline)
- [ ] Adequate spacing between buttons
- [ ] Can tap buttons accurately
- [ ] No accidental taps
- [ ] Visual feedback on tap (button press effect)

**Test each button:**
- [ ] Generate PDF button
- [ ] Add Comment Pin button
- [ ] Undo button
- [ ] Redo button
- [ ] Help button
- [ ] Export button
- [ ] Thumbnail + button
- [ ] Thumbnail × button
- [ ] Modal close button

**Issues Found:**
```
[Describe any issues]
```

### 2.2 Tap Responses
- [ ] Single tap works consistently
- [ ] No double-tap required
- [ ] No delay in response
- [ ] Visual feedback immediate
- [ ] No ghost taps or missed taps

**Issues Found:**
```
[Describe any issues]
```

### 2.3 Long Press (if applicable)
- [ ] Long press doesn't trigger unintended actions
- [ ] Context menus don't interfere
- [ ] Long press on links behaves normally

**Issues Found:**
```
[Describe any issues]
```

---

## 3. File Upload Tests (Mobile)

### 3.1 Mobile File Picker
- [ ] Tap drop zone opens file picker
- [ ] Can navigate to files
- [ ] Can select from:
  - [ ] Files app (iOS)
  - [ ] Google Drive
  - [ ] Downloads folder
  - [ ] iCloud (iOS)
  - [ ] Other storage providers
- [ ] PDF file type filter works
- [ ] Selected file loads correctly

**Issues Found:**
```
[Describe any issues]
```

### 3.2 Drag and Drop (if supported)
- [ ] Drag-drop works (iPadOS with pointer)
- [ ] Or appropriately disabled on touch-only devices
- [ ] No errors if drag-drop attempted
- [ ] Alternative method (tap) works

**Issues Found:**
```
[Describe any issues]
```

### 3.3 Large File Handling
- [ ] Can upload 5 MB file
- [ ] Can upload 10 MB file
- [ ] Warning appears for large files
- [ ] Loading indicator shows
- [ ] No crashes or freezes

**Test with:**
- [ ] 1 MB PDF (5 pages)
- [ ] 5 MB PDF (20 pages)
- [ ] 10 MB PDF (50 pages)

**Issues Found:**
```
[Describe any issues]
```

---

## 4. Touch Gestures & Scrolling

### 4.1 Scrolling
- [ ] Smooth scrolling in thumbnail area
- [ ] Smooth scrolling in viewer
- [ ] No rubber-banding issues
- [ ] Momentum scrolling works
- [ ] Can scroll with one finger
- [ ] Scroll doesn't lag

**Test areas:**
- [ ] Thumbnails (horizontal scroll)
- [ ] Viewer (vertical scroll)
- [ ] Help modal (vertical scroll)

**Issues Found:**
```
[Describe any issues]
```

### 4.2 Pinch to Zoom
- [ ] Pinch zoom works in viewer (if enabled)
- [ ] Or appropriately disabled
- [ ] Doesn't break layout
- [ ] Can zoom out again
- [ ] No text reflow issues

**Note:** May be intentionally disabled for PDF viewer

**Issues Found:**
```
[Describe any issues]
```

### 4.3 Swipe Gestures
- [ ] Swipe doesn't navigate browser back
- [ ] Swipe doesn't interfere with drag operations
- [ ] Pull-to-refresh disabled (if appropriate)
- [ ] No unintended gesture conflicts

**Issues Found:**
```
[Describe any issues]
```

---

## 5. Page Management (Touch)

### 5.1 Page Reordering
- [ ] Can tap and hold thumbnail
- [ ] Visual feedback during drag
- [ ] Can drag to reorder (if supported)
- [ ] Touch drag is smooth
- [ ] No accidental page selection
- [ ] Page order updates correctly

**Test scenarios:**
- [ ] Reorder in portrait mode
- [ ] Reorder in landscape mode
- [ ] Reorder 5+ pages

**Issues Found:**
```
[Describe any issues]
```

### 5.2 Page Duplication
- [ ] Can tap thumbnail to show actions
- [ ] + button visible and tap-able
- [ ] Adequate touch target size
- [ ] Duplicate works on tap
- [ ] No accidental triggers
- [ ] Page appears correctly

**Issues Found:**
```
[Describe any issues]
```

### 5.3 Page Deletion
- [ ] × button visible and tap-able
- [ ] Adequate touch target size
- [ ] Confirmation dialog appears
- [ ] Confirmation buttons tap-able
- [ ] Delete works correctly
- [ ] Cannot delete last page

**Issues Found:**
```
[Describe any issues]
```

---

## 6. Annotation Tests (Touch)

### 6.1 Adding Annotations
- [ ] Tap "Add Comment Pin" button
- [ ] Button shows active state
- [ ] Tap on page adds pin
- [ ] Tap accuracy good (pin at tap point)
- [ ] Mobile keyboard appears for text input
- [ ] Can type annotation text
- [ ] Keyboard doesn't obscure modal
- [ ] Can dismiss keyboard
- [ ] Pin appears at correct location

**Test:**
- [ ] Add annotation near top of page
- [ ] Add annotation near bottom
- [ ] Add annotation near edges
- [ ] Add multiple annotations

**Issues Found:**
```
[Describe any issues]
```

### 6.2 Editing Annotations
- [ ] Tap pin shows action buttons
- [ ] Edit button visible and tap-able
- [ ] Tap edit shows prompt
- [ ] Mobile keyboard appears
- [ ] Can edit text
- [ ] Text updates correctly

**Issues Found:**
```
[Describe any issues]
```

### 6.3 Changing Colors
- [ ] Tap pin shows action buttons
- [ ] Color button visible and tap-able
- [ ] Color picker appears
- [ ] All 6 colors visible
- [ ] Color swatches tap-able (32x32px min)
- [ ] Color changes on tap
- [ ] Picker closes automatically

**Test all colors:**
- [ ] 🔴 Red
- [ ] 🟠 Orange
- [ ] 🟡 Yellow
- [ ] 🟢 Green
- [ ] 🔵 Blue
- [ ] 🟣 Purple

**Issues Found:**
```
[Describe any issues]
```

### 6.4 Moving Annotations (Touch Drag)
- [ ] Tap and hold pin
- [ ] Visual feedback during drag
- [ ] Can drag to new location
- [ ] Touch drag is smooth
- [ ] Pin doesn't jump or snap unexpectedly
- [ ] Pin stays within page bounds
- [ ] Position updates after release

**Issues Found:**
```
[Describe any issues]
```

### 6.5 Deleting Annotations
- [ ] Tap pin shows action buttons
- [ ] Delete button visible and tap-able
- [ ] Confirmation appears
- [ ] Confirmation buttons tap-able
- [ ] Annotation removed correctly

**Issues Found:**
```
[Describe any issues]
```

---

## 7. Keyboard & Modal Tests (Mobile)

### 7.1 Help Modal
- [ ] Tap Help button (❓) opens modal
- [ ] Modal fits screen (portrait)
- [ ] Modal fits screen (landscape)
- [ ] Content scrollable
- [ ] Close button visible and tap-able
- [ ] Tap outside closes modal
- [ ] No issues with modal on mobile

**Issues Found:**
```
[Describe any issues]
```

### 7.2 Prompts & Dialogs
- [ ] Filename prompt appears correctly
- [ ] Mobile keyboard for text input
- [ ] OK/Cancel buttons tap-able
- [ ] Confirmation dialogs clear
- [ ] Dialog buttons adequately sized
- [ ] No keyboard obscuring issues

**Test prompts:**
- [ ] Add annotation prompt
- [ ] Edit annotation prompt
- [ ] Export filename prompt
- [ ] Export metadata prompts
- [ ] Delete confirmation
- [ ] Duplicate confirmation (if any)

**Issues Found:**
```
[Describe any issues]
```

### 7.3 Virtual Keyboard
- [ ] Keyboard appears when needed
- [ ] Keyboard doesn't break layout
- [ ] Can type on keyboard
- [ ] Autocorrect doesn't interfere
- [ ] Can dismiss keyboard
- [ ] Layout reflows with keyboard open

**Issues Found:**
```
[Describe any issues]
```

---

## 8. Undo/Redo (Mobile)

### 8.1 Button Interaction
- [ ] Undo button tap-able
- [ ] Redo button tap-able
- [ ] Button states update (disabled/enabled)
- [ ] Tooltips appear (if hovering with pointer)
- [ ] Actions undo/redo correctly

**Issues Found:**
```
[Describe any issues]
```

### 8.2 Keyboard Shortcuts (External Keyboard)
If testing with external keyboard (iPad with keyboard):
- [ ] Cmd+Z (iOS) or Ctrl+Z (Android) works
- [ ] Cmd+Y or Ctrl+Y works
- [ ] ? key opens help
- [ ] Esc closes modal

**Issues Found:**
```
[Describe any issues]
```

---

## 9. Export Tests (Mobile)

### 9.1 Export Workflow
- [ ] Export button tap-able
- [ ] Filename prompt appears
- [ ] Can type filename on mobile keyboard
- [ ] .pdf extension added automatically
- [ ] Metadata prompts appear
- [ ] Can skip metadata (optional)
- [ ] Export initiates

**Issues Found:**
```
[Describe any issues]
```

### 9.2 Download Handling
- [ ] File downloads to device
- [ ] Download notification appears
- [ ] Can find downloaded file
- [ ] Downloaded file opens in PDF viewer
- [ ] File contents correct

**Test on:**
- [ ] iOS Safari → Downloads to Files app
- [ ] Android Chrome → Downloads folder
- [ ] Can open with:
  - [ ] Native PDF viewer
  - [ ] Adobe Acrobat (if installed)
  - [ ] Other PDF apps

**Issues Found:**
```
[Describe any issues]
```

---

## 10. Performance Tests (Mobile)

### 10.1 App Responsiveness
- [ ] UI responds quickly to taps (< 100ms)
- [ ] Page switches smooth
- [ ] Annotation adding instant
- [ ] No lag during scrolling
- [ ] No janky animations
- [ ] Export completes reasonably quickly

**Response Times:**
- Tap to response: ________ ms (perceived)
- Page switch: ________ ms
- Add annotation: ________ ms
- Export: ________ seconds

**Issues Found:**
```
[Describe any issues]
```

### 10.2 Battery & Heat
- [ ] Reasonable battery drain
- [ ] Device doesn't overheat
- [ ] Can use for 10+ minutes without issues
- [ ] App doesn't drain battery rapidly

**Battery Test:**
- Starting battery: ________ %
- After 10 minutes: ________ %
- Battery drain: ________ %

**Issues Found:**
```
[Describe any issues]
```

### 10.3 Memory Usage
- [ ] App doesn't crash
- [ ] No "out of memory" errors
- [ ] Can handle moderate PDFs (5 MB, 20 pages)
- [ ] Can edit for extended time without issues

**Issues Found:**
```
[Describe any issues]
```

---

## 11. Orientation Changes

### 11.1 Portrait → Landscape
- [ ] Layout adapts automatically
- [ ] No content loss
- [ ] No UI elements hidden
- [ ] Current state preserved (loaded PDF, etc.)
- [ ] Smooth transition

**Issues Found:**
```
[Describe any issues]
```

### 11.2 Landscape → Portrait
- [ ] Layout adapts automatically
- [ ] Thumbnails move to horizontal scroll
- [ ] Viewer adjusts correctly
- [ ] Current state preserved
- [ ] Smooth transition

**Issues Found:**
```
[Describe any issues]
```

### 11.3 Rapid Orientation Changes
- [ ] Can rotate back and forth quickly
- [ ] No crashes
- [ ] Layout always correct
- [ ] No visual glitches

**Issues Found:**
```
[Describe any issues]
```

---

## 12. Network Conditions

### 12.1 Slow Network (3G)
- [ ] App loads (may be slow)
- [ ] Vendor assets load eventually
- [ ] Shows loading state
- [ ] Doesn't hang or timeout
- [ ] Functional after load

**Load time on 3G:** ________ seconds

**Issues Found:**
```
[Describe any issues]
```

### 12.2 Offline (After Initial Load)
- [ ] App continues to work
- [ ] Can load local PDFs
- [ ] All features functional
- [ ] No network errors
- [ ] Export still works

**Test steps:**
1. Load app on WiFi
2. Turn on Airplane Mode
3. Try to use app

**Issues Found:**
```
[Describe any issues]
```

### 12.3 Network Loss During Operation
- [ ] Doesn't crash if network lost
- [ ] Can continue working
- [ ] No data loss
- [ ] Graceful error handling (if any network calls)

**Issues Found:**
```
[Describe any issues]
```

---

## 13. Mobile-Specific Issues

### 13.1 iOS-Specific
- [ ] Safari specific features work
- [ ] No iOS-specific bugs
- [ ] Home screen bookmark works (if applicable)
- [ ] PWA features work (if applicable)
- [ ] Safe area insets respected (notch)

**iOS Version:** ____________

**Issues Found:**
```
[Describe any issues]
```

### 13.2 Android-Specific
- [ ] Chrome specific features work
- [ ] No Android-specific bugs
- [ ] Back button behavior correct
- [ ] Home screen shortcut works (if applicable)
- [ ] PWA features work (if applicable)

**Android Version:** ____________

**Issues Found:**
```
[Describe any issues]
```

### 13.3 Tablet-Specific (iPad/Android Tablet)
- [ ] Uses larger layout appropriately
- [ ] Not just scaled-up phone UI
- [ ] Thumbnails on side (landscape)
- [ ] Touch targets still adequate
- [ ] Takes advantage of screen space

**Issues Found:**
```
[Describe any issues]
```

---

## 14. Accessibility (Mobile)

### 14.1 VoiceOver (iOS) / TalkBack (Android)
If testing with screen reader:
- [ ] Can enable screen reader
- [ ] All buttons announced
- [ ] Navigation logical
- [ ] Can perform all actions
- [ ] Labels make sense

**Note:** Full screen reader testing may be separate task

**Issues Found:**
```
[Describe any issues]
```

### 14.2 Dynamic Type / Font Scaling
- [ ] Larger text settings respected
- [ ] Layout doesn't break with large text
- [ ] Still readable and usable

**Test at:** ________ % text scaling

**Issues Found:**
```
[Describe any issues]
```

### 14.3 High Contrast / Dark Mode
- [ ] Readable in high contrast mode (if OS supports)
- [ ] Dark mode supported (if implemented)
- [ ] Or gracefully uses system theme

**Issues Found:**
```
[Describe any issues]
```

---

## 15. Edge Cases & Stress Tests

### 15.1 Rapid Interactions
- [ ] Fast tapping doesn't break UI
- [ ] Multiple quick actions handled
- [ ] No duplicate operations
- [ ] UI remains responsive

**Test:**
- [ ] Tap button 10 times rapidly
- [ ] Add 5 annotations quickly
- [ ] Switch pages rapidly

**Issues Found:**
```
[Describe any issues]
```

### 15.2 Long Sessions
- [ ] Can use app for 30+ minutes
- [ ] No slowdown over time
- [ ] No memory leaks
- [ ] No crashes

**Session length:** ________ minutes

**Issues Found:**
```
[Describe any issues]
```

### 15.3 Background/Foreground
- [ ] App survives backgrounding
- [ ] State preserved when returning
- [ ] No crashes on return
- [ ] PDF still loaded

**Test:**
1. Load PDF
2. Switch to another app
3. Wait 1 minute
4. Return to app

**Issues Found:**
```
[Describe any issues]
```

---

## Summary

### Overall Mobile Experience

**Rating:** ⭐⭐⭐⭐⭐ (out of 5)

**Critical Issues:** ______ (Blocks mobile use)
**Major Issues:** ______ (Significantly degrades experience)
**Minor Issues:** ______ (Small annoyances)

### Critical Issues Found
```
1. [Issue description]
   Severity: Critical
   Device: [Device name]
   Steps to reproduce: [Steps]
```

### Major Issues Found
```
1. [Issue description]
   Severity: Major
   Device: [Device name]
   Steps to reproduce: [Steps]
```

### Minor Issues Found
```
1. [Issue description]
   Severity: Minor
   Device: [Device name]
   Steps to reproduce: [Steps]
```

### Device-Specific Notes
```
[Any unique behavior or quirks on this device]
```

### Usability Assessment

**Touch Interface:**
- Target sizes: ☐ Excellent  ☐ Good  ☐ Needs Work
- Responsiveness: ☐ Excellent  ☐ Good  ☐ Needs Work
- Gestures: ☐ Excellent  ☐ Good  ☐ Needs Work

**Layout:**
- Portrait: ☐ Excellent  ☐ Good  ☐ Needs Work
- Landscape: ☐ Excellent  ☐ Good  ☐ Needs Work
- Readability: ☐ Excellent  ☐ Good  ☐ Needs Work

**Performance:**
- Load time: ☐ Excellent  ☐ Good  ☐ Needs Work
- Responsiveness: ☐ Excellent  ☐ Good  ☐ Needs Work
- Stability: ☐ Excellent  ☐ Good  ☐ Needs Work

### Recommendation

**Mobile Launch Status:**
- [ ] ✅ Ready for mobile launch (excellent experience)
- [ ] ⚠️ Usable but needs improvements
- [ ] ❌ Not ready (critical mobile issues)

**Next Steps:**
```
[List any required fixes or follow-up testing]
```

---

**Tester Signature:** ________________
**Date Completed:** ________________
**Time Spent:** ________________
**Device Kept:** ☐ Yes  ☐ No (borrowed)

---

**Document Version:** 1.0
**Last Updated:** October 31, 2025
**Status:** Ready for Use
