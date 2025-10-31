# Keyboard Shortcuts Reference

Quick reference for all keyboard shortcuts in see_pdfeditor.

---

## 🎹 Essential Shortcuts

### Navigation
| Shortcut | Action |
|----------|--------|
| **Tab** | Move to next interactive element |
| **Shift + Tab** | Move to previous interactive element |
| **Enter** | Activate focused button/link |
| **Space** | Activate focused button |

### Help & Interface
| Shortcut | Action |
|----------|--------|
| **?** | Show keyboard shortcuts help dialog |
| **Esc** | Close help dialog or cancel current action |

---

## ✏️ Editing Shortcuts

### Undo/Redo
| Shortcut | Action |
|----------|--------|
| **Ctrl + Z** | Undo last action |
| **Ctrl + Y** | Redo last undone action |
| **Ctrl + Shift + Z** | Redo (alternative) |

**What can be undone:**
- Page deletion
- Page duplication
- Page reordering
- Annotation addition
- Annotation editing
- Annotation deletion

**History limit:** Last 50 actions

---

## 📄 Page Management Shortcuts

### Keyboard Page Operations
| Shortcut | Action | Requirements |
|----------|--------|--------------|
| **Ctrl + Arrow Up** | Move focused page up | Thumbnail must be focused |
| **Ctrl + Arrow Down** | Move focused page down | Thumbnail must be focused |
| **Delete** | Delete focused page | Thumbnail must be focused, confirms first |
| **D** | Duplicate focused page | Thumbnail must be focused |

**How to focus a thumbnail:**
1. Press **Tab** until a thumbnail has a blue outline
2. Or click on a thumbnail
3. Then use the shortcuts above

**Accessibility:** Screen readers will announce page position changes.

---

## 🎯 Workflow Shortcuts

### Fast Editing Workflow

**Reorder pages quickly:**
```
1. Tab to thumbnail (first one)
2. Ctrl+Down (move down)
3. Ctrl+Down (move down again)
4. Ctrl+Z (oops, undo one move)
5. Tab (next thumbnail)
6. Ctrl+Up (move up)
```

**Duplicate and modify:**
```
1. Tab to thumbnail
2. D (duplicate)
3. Tab to next (the duplicate)
4. Click on page to add annotation
```

**Delete multiple pages:**
```
1. Tab to first thumbnail to delete
2. Delete (confirm)
3. Tab (now focuses next page automatically)
4. Delete (confirm)
5. Repeat...
```

---

## 🖱️ Mouse + Keyboard Combinations

### Efficient Editing
| Action | Shortcut |
|--------|----------|
| Click + **Ctrl+Z** | Quick undo after mistake |
| Drag + **Esc** | Cancel drag operation |
| Click annotation + **Delete** | Remove annotation (if implemented) |

---

## ♿ Accessibility Shortcuts

### Screen Reader Users
| Shortcut | Action |
|----------|--------|
| **Tab** | Navigate to skip link (first tab) |
| **Enter** (on skip link) | Jump to main content |
| **Tab** through thumbnails | Hear page position and instructions |
| **Ctrl + Arrow** | Reorder pages, announces new position |

### Keyboard-Only Users
- **All features are fully keyboard accessible**
- **No mouse required**
- **Tab order is logical and predictable**
- **Focus indicators are highly visible (3px blue outline)**

---

## 📱 Touch Device Shortcuts

### iPad/Tablet Gestures
| Gesture | Action |
|---------|--------|
| **Tap** | Select/activate |
| **Long press** | Show thumbnail actions |
| **Drag** | Move pages or annotations |
| **Pinch** | Zoom page (if supported) |
| **Two-finger scroll** | Scroll thumbnails or page |

---

## ⚙️ Browser Shortcuts

### Useful Browser Shortcuts
| Shortcut | Action |
|----------|--------|
| **Ctrl + R** | Refresh page (reload app) |
| **Ctrl + Shift + R** | Hard refresh (clear cache) |
| **F12** | Open developer tools (for debugging) |
| **Ctrl + +** | Zoom in |
| **Ctrl + -** | Zoom out |
| **Ctrl + 0** | Reset zoom to 100% |
| **F11** | Fullscreen mode |

---

## 🎓 Pro Tips

### Efficiency Tips

**1. Master the keyboard workflow:**
```
Tab → Focus
D → Duplicate
Ctrl+Arrow → Reorder
Delete → Remove
Ctrl+Z → Undo mistakes
```

**2. Combine shortcuts:**
- Tab + D + Tab + D = Duplicate twice quickly
- Ctrl+Arrow Up × 3 = Move up 3 positions
- Delete + Delete + Delete = Remove 3 pages fast

**3. Use undo liberally:**
- Made a mistake? Ctrl+Z immediately
- Experimenting? Try it, then undo if needed
- No penalty for undoing - history saves 50 actions

**4. Learn the help shortcut:**
- Press **?** anytime you forget shortcuts
- Escape to close and continue working

---

## 🚫 Disabled/No Shortcuts

These actions **do not** have keyboard shortcuts:

- **File loading** - Must use file picker or drag-drop
- **Annotation text input** - Uses standard text editing
- **Export dialog** - Uses standard prompts
- **Annotation color selection** - Must click color
- **Thumbnail preview zoom** - Mouse hover only

**Why?** These actions require visual interaction or file system access.

---

## 🔧 Customizing Shortcuts

**Can I change shortcuts?**
No, shortcuts are currently fixed. Future versions may support customization.

**Can I disable shortcuts?**
No, but pressing Esc cancels most actions.

**Conflicts with browser shortcuts?**
Our shortcuts are designed to avoid common browser shortcuts. If you experience conflicts, please report them.

---

## 📖 Learning Resources

### Practice Shortcuts
1. Click "📄 Generate sample PDF" button
2. Try each shortcut listed above
3. Press **?** to see help anytime
4. Experiment - you can't break anything!

### Shortcut Cheat Sheet (Print-Friendly)

```
═══════════════════════════════════════════════════════════
                    see_pdfeditor
                 KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════

NAVIGATION
  Tab                Move to next element
  Shift+Tab          Move to previous element
  Enter/Space        Activate focused element

HELP
  ?                  Show shortcuts help
  Esc                Close help/cancel action

EDITING
  Ctrl+Z             Undo last action
  Ctrl+Y             Redo last undo
  Ctrl+Shift+Z       Redo (alternative)

PAGE OPERATIONS (Thumbnail must be focused)
  Ctrl+Arrow Up      Move page up
  Ctrl+Arrow Down    Move page down
  Delete             Delete page (with confirmation)
  D                  Duplicate page

WORKFLOW
  Tab → D            Focus thumbnail → Duplicate
  Tab → Delete       Focus thumbnail → Delete
  Tab → Ctrl+Arrow   Focus thumbnail → Reorder

ACCESSIBILITY
  Tab (first)        Skip to main content link
  Ctrl+Arrow         Reorder + screen reader announcement

═══════════════════════════════════════════════════════════
                   Pro Tip: Press ? anytime!
═══════════════════════════════════════════════════════════
```

---

## ❓ FAQ

**Q: Why doesn't Ctrl+S save?**
A: Use the "Export PDF" button instead. Browser apps don't have traditional save.

**Q: Can I use Cmd key on Mac?**
A: Yes! Cmd+Z, Cmd+Y work the same as Ctrl on Mac.

**Q: What if I press the wrong key?**
A: Most actions can be undone with Ctrl+Z. Press Esc to cancel ongoing actions.

**Q: Why don't shortcuts work?**
A: Ensure the app window is focused (click anywhere first). Some shortcuts need specific focus (e.g., thumbnail for page operations).

**Q: Can I use shortcuts on mobile?**
A: Physical keyboards work on tablets. On-screen keyboards don't support all shortcuts.

---

**Last Updated:** October 31, 2025
**Version:** 1.0
**For:** see_pdfeditor Prototype

**Print this page for quick reference while editing!**
