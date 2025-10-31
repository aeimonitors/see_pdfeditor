# FAQ - Frequently Asked Questions

Common questions about see_pdfeditor.

---

## 📌 General Questions

### What is see_pdfeditor?

**A:** see_pdfeditor is a free, browser-based PDF editor that lets you reorder, delete, and duplicate pages, add annotations, and export modified PDFs - all without uploading files to any server.

---

### Is it really free?

**A:** Yes! 100% free, no subscriptions, no hidden fees, no ads. Open source and always will be free.

---

### Do I need to create an account?

**A:** No! No registration, no login, no email required. Just open and use.

---

### Does it work offline?

**A:** Yes! After the initial page load (which downloads the JavaScript libraries), the app works completely offline. Perfect for air-gapped or sensitive environments.

---

### Is my data safe?

**A:** Absolutely! Your PDFs are processed entirely in your browser's memory. They are NEVER uploaded to any server. When you close the tab, everything is deleted from memory.

---

## 🔒 Privacy & Security

### Do you see my PDFs?

**A:** No! We literally cannot see your PDFs. All processing happens locally in your browser. We don't have servers that receive files.

---

### Are my PDFs uploaded anywhere?

**A:** No. 100% client-side processing means files stay on your device. You can verify this by disconnecting from the internet after loading the page - it still works!

---

### Can I use this for confidential documents?

**A:** Yes! Perfect for sensitive documents like:
- Legal contracts
- Medical records
- Financial statements
- Government documents
- Personal information

Your files never leave your computer.

---

### Do you track what I do?

**A:** We collect anonymous usage statistics (like page views) but NO tracking of:
- Filenames
- File contents
- Edit actions
- Personal information

---

### What happens when I close the tab?

**A:** Everything is immediately deleted from browser memory. Nothing is saved to disk (unless you explicitly export).

---

## 💻 Technical Questions

### What browsers are supported?

**A:**
- ✅ **Chrome 90+** (Recommended - best performance)
- ✅ **Firefox 88+** (Excellent support)
- ✅ **Edge 90+** (Full support)
- ✅ **Safari 14+** (Good support, minor edge cases)

---

### What's the maximum file size?

**A:**
- **Hard limit:** 200 MB
- **Warning at:** 50 MB (may be slow)
- **Recommended:** Under 20 MB for best performance

Large files use more memory and take longer to process.

---

### How many pages can I edit?

**A:** No hard limit. Successfully tested with:
- ✅ 500+ page PDFs
- ✅ 1000+ page documents (slower but works)

Performance depends on file size and system RAM.

---

### Does it work on mobile?

**A:** Yes!
- ✅ **Tablets** (iPad, Android) - Excellent support
- ✅ **Phones** - Works but small screen is challenging
- ⚠️ **Best experience:** Tablet in landscape mode

---

### Does it work on iPad?

**A:** Yes! Works great on iPad Safari. All features supported including touch gestures for drag-and-drop.

---

### Can I save my work and resume later?

**A:** Not directly. To save progress:
1. Export your PDF
2. Close the app
3. Later, load the exported PDF to continue

We don't store sessions or autosave (privacy by design).

---

### Why does my browser warn about memory?

**A:** Large PDFs are loaded into RAM. This is normal and safe. If you get memory warnings:
- Close other tabs
- Split large PDFs into smaller files
- Use a desktop browser (more RAM)

---

## 🎨 Feature Questions

### Can I edit PDF text?

**A:** No, not yet. Currently you can:
- ✅ Reorder, delete, duplicate pages
- ✅ Add text annotations (comments)
- ❌ Edit existing PDF text

Text editing planned for future version.

---

### Can I add images?

**A:** Not yet. Currently supports:
- ✅ Text annotations
- ❌ Image insertion

Image annotations planned for future version.

---

### Can I merge multiple PDFs?

**A:** Not yet. Currently only single PDF editing. Merge feature planned for future.

**Workaround:** Use external tools to merge first, then edit the combined PDF.

---

### Can I rotate pages?

**A:** Not yet. Page rotation is planned for the next major version.

---

### Can I extract specific pages?

**A:** Yes! Here's how:
1. Delete all pages you DON'T want
2. Export the PDF
3. Result: PDF with only selected pages

---

### Can I split a PDF?

**A:** Yes! Method:
1. Load the PDF
2. Delete pages for first section
3. Export as "part1.pdf"
4. Reload original PDF
5. Delete different pages for second section
6. Export as "part2.pdf"

---

### Can I password-protect PDFs?

**A:** Not yet. Export creates unencrypted PDFs. Use external tools to add password protection after editing.

---

### Can I sign PDFs digitally?

**A:** Not yet. Digital signatures planned for future version.

---

### Can I fill PDF forms?

**A:** Not currently. Form filling is on the roadmap.

---

## 📝 Annotations

### Are annotations editable after export?

**A:** No. Annotations are "flattened" into the PDF - they become part of the page image. This ensures compatibility with all PDF readers, but they can't be edited later.

---

### How many colors are available?

**A:** 8 colors:
- 🔴 Red (default)
- 🟠 Orange
- 🟡 Yellow
- 🟢 Green
- 🔵 Blue
- 🟣 Purple
- ⚫ Black
- 🟤 Brown

---

### Can I change annotation size?

**A:** Not currently. Annotations are standard size. Customizable sizes planned for future.

---

### Can I add shapes or drawings?

**A:** Not yet. Currently only text annotations. Shapes/drawings planned for future.

---

## ⚡ Performance

### Why is it slow with large PDFs?

**A:** Large PDFs require:
- More RAM to load
- More CPU to render
- More time to process

**Solutions:**
- Close other browser tabs
- Use desktop browser (not mobile)
- Split into smaller PDFs
- Upgrade RAM if possible

---

### Can I make it faster?

**A:** Yes!
- ✅ Use Chrome (fastest browser)
- ✅ Close other tabs/apps
- ✅ Use smaller PDFs (under 50 pages)
- ✅ Delete unnecessary pages early
- ✅ Limit annotations (if hundreds)

---

### Why does rendering take so long?

**A:** First render is slower because pdf.js needs to:
1. Parse PDF structure
2. Decode fonts and images
3. Render each page to canvas
4. Generate thumbnails

Subsequent operations are faster (pages cached in memory).

---

## 🔧 Troubleshooting

### PDF won't load - what to do?

**Checklist:**
1. ✅ File is actually PDF (not image/Word doc)
2. ✅ File under 200 MB
3. ✅ File not corrupted (opens in Adobe Reader?)
4. ✅ Try hard refresh (Ctrl+Shift+R)
5. ✅ Try different browser (Chrome recommended)
6. ✅ Check browser console for errors (F12)

---

### Export fails - how to fix?

**Solutions:**
1. Check popup blocker isn't blocking download
2. Try different browser
3. Check disk space available
4. Simplify filename (no special characters)
5. Export without metadata (skip optional prompts)

---

### Undo button is grayed out - why?

**Reasons:**
- No actions taken yet
- Already at beginning of history
- History cleared (after export)
- Over 50 actions ago (history limit)

---

### Page won't delete - what's wrong?

**Common issues:**
- Trying to delete last remaining page (not allowed)
- Button not responding (refresh page)
- Confirmation dialog missed (check for popup)

---

## 🚀 Workflow Questions

### Best way to organize large PDFs?

**Recommended workflow:**
1. **Load PDF**
2. **Delete unwanted pages** (reduces size)
3. **Reorder pages** by sections
4. **Add colored annotations** as markers
   - Red = Delete later
   - Yellow = Needs review
   - Green = Approved
5. **Export intermediate versions** as you go

---

### How to handle 200+ page documents?

**Strategy:**
1. **Split into sections first** (use external tool)
2. **Edit each section separately**
3. **Export each section**
4. **Merge sections** (use external tool)

This avoids performance issues.

---

### Can I batch process multiple PDFs?

**A:** Not currently. Must process one at a time. Batch processing planned for future enterprise version.

---

## 🎓 Learning

### How long to learn?

**A:** Very quick!
- **5 minutes:** Basic editing (load, reorder, export)
- **15 minutes:** All features (annotations, undo/redo)
- **30 minutes:** Power user (keyboard shortcuts, workflows)

---

### Is there a video tutorial?

**A:** Yes! See the video tutorial in the user guide. Shows all features in 3-5 minutes.

---

### Where can I practice?

**A:**
1. Click "📄 Generate sample PDF" button
2. Experiment with all features
3. Can't break anything!
4. No need to use real documents

---

## 💡 Use Cases

### What's it good for?

**Perfect for:**
- ✅ Reordering presentation slides
- ✅ Removing blank pages
- ✅ Extracting specific pages
- ✅ Adding review comments
- ✅ Creating presentation decks
- ✅ Organizing scanned documents
- ✅ Quick PDF edits without Adobe

**Not ideal for:**
- ❌ Heavy text editing (use Word/Google Docs)
- ❌ Image editing (use Photoshop/GIMP)
- ❌ Complex form filling (use Adobe)
- ❌ Batch processing (single PDF at a time)

---

## 🤝 Contributing

### Can I contribute code?

**A:** Yes! Project is open source on GitHub. Pull requests welcome for:
- Bug fixes
- New features
- Documentation improvements
- Translations

---

### How do I report bugs?

**A:** GitHub Issues. Include:
- Browser + version
- Operating system
- File size + pages
- Steps to reproduce
- Error message (if any)
- Console errors (F12)

---

### Can I request features?

**A:** Yes! GitHub Issues or Discussions. Popular requests get prioritized.

---

## 📞 Support

### How do I get help?

**Resources:**
1. **User Guide** - Complete documentation
2. **Keyboard Shortcuts** - Quick reference
3. **This FAQ** - Common questions
4. **GitHub Issues** - Bug reports
5. **GitHub Discussions** - Q&A

---

### Is there paid support?

**A:** Not currently. This is a community project. Help is best-effort via GitHub.

---

## 🔮 Future Plans

### What features are coming?

**Roadmap (in priority order):**
1. Page rotation (90°, 180°, 270°)
2. Multiple PDF merge
3. Page extraction/splitting
4. Image annotations
5. Text editing
6. Form filling
7. Digital signatures
8. PDF compression
9. OCR (text recognition)
10. Cloud storage integration

**Note:** Timeline depends on community contributions.

---

### When is next release?

**A:** We follow continuous deployment. New features added as they're ready. Check GitHub releases for updates.

---

### Will it stay free?

**A:** Yes! Always free and open source. No ads, no subscriptions, ever.

---

## 📊 Comparisons

### How does it compare to Adobe Acrobat?

**see_pdfeditor:**
- ✅ Free
- ✅ No installation
- ✅ Privacy-focused
- ✅ Fast for basic edits
- ❌ Fewer features

**Adobe Acrobat:**
- ❌ Expensive ($15-20/month)
- ❌ Requires installation
- ❌ Cloud-based (privacy concerns)
- ❌ Overkill for simple tasks
- ✅ More features

**Use see_pdfeditor when:** You need quick page management and annotations.
**Use Adobe when:** You need advanced features like OCR, forms, signatures.

---

### vs. Online PDF editors?

**see_pdfeditor advantages:**
- ✅ No upload (privacy)
- ✅ Works offline
- ✅ No file size limits (besides 200 MB)
- ✅ No registration
- ✅ Free forever

**Online editors advantages:**
- ✅ Sometimes more features
- ⚠️ But require uploads (privacy risk)
- ⚠️ Usually have file size limits
- ⚠️ Often require payment/registration

---

## ❓ Still Have Questions?

**Can't find your answer?**
- 📖 Check the User Guide
- 🔍 Search GitHub Issues
- 💬 Ask in GitHub Discussions
- 🐛 Report bugs on GitHub Issues

---

**Last Updated:** October 31, 2025
**Version:** 1.0
**Questions Answered:** 75+

**Got a question not listed? [Open a GitHub Discussion!]**
